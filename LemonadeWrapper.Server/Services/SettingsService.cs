using LemonadeWrapper.Server.Models;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;

namespace LemonadeWrapper.Server.Services;

/// <summary>
/// Reads and writes user settings (AI server URL + API key) to a JSON file
/// stored alongside the database in the server's content root.
/// Registered as a Singleton so the in-memory copy is shared across requests.
/// </summary>
public class SettingsService : ISettingsService
{
    private readonly string _filePath;
    private AppSettingsModel _cached;
    private readonly object _lock = new();

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
    };

    public SettingsService(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "user-settings.json");
        _cached = ReadFromDisk();
    }

    public AppSettingsModel Load() => _cached;

    public void Save(AppSettingsModel settings)
    {
        lock (_lock)
        {
            _cached = settings;
            File.WriteAllText(_filePath, JsonSerializer.Serialize(settings, _jsonOptions));
        }
    }

    private AppSettingsModel ReadFromDisk()
    {
        try
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                return JsonSerializer.Deserialize<AppSettingsModel>(json) ?? new AppSettingsModel();
            }
        }
        catch
        {
            // Corrupt or missing file — start fresh
        }
        return new AppSettingsModel();
    }
}
