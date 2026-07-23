using LemonadeWrapper.Server.Models;

namespace LemonadeWrapper.Server.Services;

public interface ISettingsService
{
    AppSettingsModel Load();
    void Save(AppSettingsModel settings);
}
