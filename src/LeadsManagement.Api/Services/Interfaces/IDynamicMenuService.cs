using System.Collections.Generic;
using System.Threading.Tasks;
using LeadsManagement.Api.Models.Dtos;

namespace LeadsManagement.Api.Services.Interfaces;

public interface IDynamicMenuService
{
    Task<List<DynamicMenuTreeNodeDto>> GetMenuTreeAsync();
    Task<List<DynamicMenuTreeNodeDto>> GetAllMenusFlatAsync();
    Task<DynamicMenuTreeNodeDto> AddMenuAsync(CreateDynamicMenuDto dto);
    Task<DynamicMenuTreeNodeDto?> UpdateMenuAsync(string id, UpdateDynamicMenuDto dto);
    Task<bool> DeleteMenuAsync(string id);
    Task<bool> SaveMenuTreeAsync(List<DynamicMenuTreeNodeDto> fullTree);
    Task<List<DynamicMenuTreeNodeDto>> ResetToDefaultsAsync();
}
