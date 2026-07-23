using LemonadeWrapper.Server.Models;
using LemonadeWrapper.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace LemonadeWrapper.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LemonadeServerController : ControllerBase
    {
        private readonly IChatSessionService _chatSessionService;
        private readonly IChatMessageService _chatMessageService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ISettingsService _settingsService;

        public LemonadeServerController(
            IChatSessionService chatSessionService,
            IChatMessageService chatMessageService,
            IHttpClientFactory httpClientFactory,
            ISettingsService settingsService)
        {
            _chatSessionService = chatSessionService;
            _chatMessageService = chatMessageService;
            _httpClientFactory = httpClientFactory;
            _settingsService = settingsService;
        }

        [HttpGet("settings")]
        public IActionResult GetSettings()
        {
            return Ok(_settingsService.Load());
        }

        [HttpPut("settings")]
        public IActionResult SaveSettings([FromBody] AppSettingsModel settings)
        {
            _settingsService.Save(settings);
            return Ok();
        }

        /// <summary>
        /// Proxies GET {aiServerUrl}/v1/models and returns the model list.
        /// Accepts url and apiKey as query parameters to avoid exposing the key in logs.
        /// </summary>
        [HttpGet("models")]
        public async Task<IActionResult> GetModels(
            [FromQuery] string url,
            [FromQuery] string apiKey,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("url query parameter is required.");

            var httpClient = _httpClientFactory.CreateClient();
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            }

            try
            {
                var modelsUrl = url.TrimEnd('/') + "/v1/models";
                var res = await httpClient.GetAsync(modelsUrl, cancellationToken);
                var body = await res.Content.ReadAsStringAsync(cancellationToken);

                if (!res.IsSuccessStatusCode)
                    return StatusCode((int)res.StatusCode, body);

                // Parse the OpenAI-compatible response and return just the id list
                using var doc = JsonDocument.Parse(body);
                var ids = doc.RootElement
                    .GetProperty("data")
                    .EnumerateArray()
                    .Select(m => m.GetProperty("id").GetString())
                    .Where(id => !string.IsNullOrEmpty(id))
                    .ToList();

                return Ok(ids);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway,
                    $"Could not reach AI server: {ex.Message}");
            }
        }

        [HttpGet("sessions/{userId}")]
        public async Task<IActionResult> GetSessions(string userId)
        {
            var sessions = await _chatSessionService.GetSessionsByUserIdAsync(userId);
            return Ok(sessions);
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
        {
            var session = await _chatSessionService.CreateSessionAsync(request.UserId, request.SessionId);
            return Ok(session);
        }

        [HttpGet("sessions/{userId}/{sessionId}/messages")]
        public async Task<IActionResult> GetMessages(string userId, string sessionId)
        {
            var session = await _chatSessionService.GetSessionAsync(userId, sessionId);
            if (session == null) return NotFound();

            var messages = await _chatMessageService.GetMessagesAsync(session.Id);
            return Ok(messages);
        }

        [HttpPost("sessions/{userId}/{sessionId}/messages")]
        public async Task<IActionResult> AddMessage(string userId, string sessionId, [FromBody] AddMessageRequest request)
        {
            var session = await _chatSessionService.GetSessionAsync(userId, sessionId);
            if (session == null) return NotFound();

            var message = await _chatMessageService.AddMessageAsync(session.Id, request.Role, request.Content, request.IsUserMessage);
            return Ok(message);
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> DeleteSession(string sessionId)
        {
            await _chatSessionService.DeleteSessionAsync(sessionId);
            return Ok();
        }

        /// <summary>
        /// Streams an AI response for the given session.
        /// The user message must already be saved in the DB before calling this.
        /// The server reads the full conversation history, forwards it to the external AI
        /// server as an OpenAI-compatible streaming request, proxies the SSE chunks back
        /// to the client, and persists the completed assistant reply to the DB.
        /// </summary>
        [HttpPost("sessions/{userId}/{sessionId}/chat")]
        public async Task StreamChat(
            string userId,
            string sessionId,
            [FromBody] ChatRequest request,
            CancellationToken cancellationToken)
        {
            var session = await _chatSessionService.GetSessionAsync(userId, sessionId);
            if (session == null)
            {
                Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }

            // Fetch full conversation history to send as context
            var history = (await _chatMessageService.GetMessagesAsync(session.Id)).ToList();

            var messages = history
                .Select(m => new { role = m.Role, content = m.Content })
                .ToList<object>();

            var modelName = !string.IsNullOrWhiteSpace(request.Model)
                ? request.Model
                : "default";

            var requestPayload = new
            {
                model = modelName,
                messages,
                stream = true
            };

            // Set SSE response headers before writing anything
            Response.ContentType = "text/event-stream; charset=utf-8";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";

            var httpClient = _httpClientFactory.CreateClient();
            if (!string.IsNullOrWhiteSpace(request.ApiKey))
            {
                httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.ApiKey);
            }

            var aiUrl = request.AiServerUrl.TrimEnd('/') + "/v1/chat/completions";

            HttpResponseMessage aiResponse;
            try
            {
                using var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestPayload),
                    Encoding.UTF8,
                    "application/json");

                var httpRequest = new HttpRequestMessage(HttpMethod.Post, aiUrl)
                {
                    Content = jsonContent
                };

                aiResponse = await httpClient.SendAsync(
                    httpRequest,
                    HttpCompletionOption.ResponseHeadersRead,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                Response.StatusCode = StatusCodes.Status502BadGateway;
                await Response.WriteAsync(
                    $"data: {JsonSerializer.Serialize("Error connecting to AI server: " + ex.Message)}\n\n",
                    cancellationToken);
                return;
            }

            if (!aiResponse.IsSuccessStatusCode)
            {
                var errorBody = await aiResponse.Content.ReadAsStringAsync(cancellationToken);
                Response.StatusCode = (int)aiResponse.StatusCode;
                await Response.WriteAsync(errorBody, cancellationToken);
                return;
            }

            var fullContent = new StringBuilder();

            try
            {
                await using var stream = await aiResponse.Content.ReadAsStreamAsync(cancellationToken);
                using var reader = new StreamReader(stream);

                while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
                {
                    var line = await reader.ReadLineAsync(cancellationToken);
                    if (line == null) break;
                    if (!line.StartsWith("data: ")) continue;

                    var data = line[6..].Trim();
                    if (data == "[DONE]") break;

                    try
                    {
                        using var doc = JsonDocument.Parse(data);
                        var choices = doc.RootElement.GetProperty("choices");
                        if (choices.GetArrayLength() == 0) continue;

                        var delta = choices[0].GetProperty("delta");
                        if (delta.TryGetProperty("content", out var contentElement))
                        {
                            var token = contentElement.GetString();
                            if (!string.IsNullOrEmpty(token))
                            {
                                fullContent.Append(token);
                                // Forward the token to the client as an SSE event
                                await Response.WriteAsync(
                                    $"data: {JsonSerializer.Serialize(token)}\n\n",
                                    cancellationToken);
                                await Response.Body.FlushAsync(cancellationToken);
                            }
                        }
                    }
                    catch (JsonException) { /* skip malformed SSE lines */ }
                }
            }
            catch (OperationCanceledException) { /* client disconnected — still save what we have */ }

            // Persist the completed assistant reply
            if (fullContent.Length > 0)
            {
                await _chatMessageService.AddMessageAsync(
                    session.Id, "assistant", fullContent.ToString(), isUserMessage: false);
            }
        }
    }
}