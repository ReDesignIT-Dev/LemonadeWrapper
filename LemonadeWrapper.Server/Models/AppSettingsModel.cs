namespace LemonadeWrapper.Server.Models
{
    public class AppSettingsModel
    {
        public string AiServerUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string SelectedModel { get; set; } = string.Empty;
    }
}
