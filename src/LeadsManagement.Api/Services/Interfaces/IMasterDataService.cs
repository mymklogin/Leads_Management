using System.Collections.Generic;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IMasterDataService
{
    // Roles
    List<SystemRoleDto> GetRoles();
    SystemRoleDto? GetRoleById(int id);
    SystemRoleDto AddOrUpdateRole(SystemRoleDto dto);
    bool DeleteRole(int id);

    // Template & Campaign Types
    List<TemplateTypeMasterDto> GetTemplateTypes(string? channel = null);
    TemplateTypeMasterDto? GetTemplateTypeById(int id);
    TemplateTypeMasterDto AddOrUpdateTemplateType(TemplateTypeMasterDto dto);
    bool DeleteTemplateType(int id);
}
