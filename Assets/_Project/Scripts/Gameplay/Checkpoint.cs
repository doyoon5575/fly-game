using UnityEngine;

/// <summary>
/// Trigger checkpoint placed in the course.
/// </summary>
[RequireComponent(typeof(Collider))]
public class Checkpoint : MonoBehaviour
{
    [SerializeField] private int checkpointIndex;
    [SerializeField] private CheckpointManager manager;

    public int CheckpointIndex => checkpointIndex;

    public void Configure(int index, CheckpointManager checkpointManager)
    {
        checkpointIndex = index;
        manager = checkpointManager;
    }

    private void Reset()
    {
        Collider triggerCollider = GetComponent<Collider>();
        triggerCollider.isTrigger = true;
    }

    private void Awake()
    {
        if (manager == null)
        {
            manager = FindObjectOfType<CheckpointManager>();
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        PlaneRaceProgress progress = other.GetComponent<PlaneRaceProgress>();
        if (progress == null || manager == null)
        {
            return;
        }

        manager.TryPassCheckpoint(this, progress);
    }
}
