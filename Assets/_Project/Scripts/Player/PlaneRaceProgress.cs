using UnityEngine;

/// <summary>
/// Stores the player's current checkpoint progression.
/// </summary>
public class PlaneRaceProgress : MonoBehaviour
{
    [SerializeField] private int nextCheckpointIndex;

    public int NextCheckpointIndex => nextCheckpointIndex;

    public void SetNextCheckpointIndex(int value)
    {
        nextCheckpointIndex = Mathf.Max(0, value);
    }

    public void AdvanceCheckpoint()
    {
        nextCheckpointIndex++;
    }

    public void ResetProgress()
    {
        nextCheckpointIndex = 0;
    }
}
