namespace AgroLink.Domain.Entities;

public class Tag
{
    public Guid TagId { get; set; }
    public string Name { get; set; }

    public ICollection<Posts> Posts { get; set; } = new List<Posts>();
}