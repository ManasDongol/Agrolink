using AgroLink.Application.ENUMS;
using AgroLink.Application.Interfaces;

namespace AgroLink.Application.Services;

public class CropService :  ICropService
{
    public string cropName(int value)
    {
        if (!Enum.IsDefined(typeof(CropMappingEnum), value))
        {
            return "unknown";
        }
        
        return((CropMappingEnum)value).ToString();
    }

    public string fertilizerName(int value)
    {
        if (!Enum.IsDefined(typeof(FertilizerMappingEnum), value))
        {
            return "unknown";
        }
        
        return((FertilizerMappingEnum)value).ToString();
    }
}