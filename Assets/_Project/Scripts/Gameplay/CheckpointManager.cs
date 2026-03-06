using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Manages checkpoint order, progression, and finish state.
/// </summary>
public class CheckpointManager : MonoBehaviour
{
    [SerializeField] private List<Checkpoint> checkpoints = new List<Checkpoint>();

    public event Action<int, int> OnCheckpointPassed;
    public event Action OnCourseFinished;

    public int TotalCheckpoints => checkpoints.Count;

    public void SetCheckpoints(IEnumerable<Checkpoint> orderedCheckpoints)
    {
        checkpoints.Clear();

        if (orderedCheckpoints == null)
        {
            return;
        }

        checkpoints.AddRange(orderedCheckpoints);
    }

    private void OnValidate()
    {
        checkpoints.RemoveAll(checkpoint => checkpoint == null);
    }

    public void TryPassCheckpoint(Checkpoint checkpoint, PlaneRaceProgress progress)
    {
        if (checkpoint == null || progress == null)
        {
            return;
        }

        if (TotalCheckpoints <= 0)
        {
            Debug.LogWarning("CheckpointManager: No checkpoints are assigned.");
            return;
        }

        int expectedIndex = progress.NextCheckpointIndex;
        if (checkpoint.CheckpointIndex != expectedIndex)
        {
            return;
        }

        progress.AdvanceCheckpoint();
        OnCheckpointPassed?.Invoke(progress.NextCheckpointIndex, TotalCheckpoints);

        if (progress.NextCheckpointIndex >= TotalCheckpoints)
        {
            OnCourseFinished?.Invoke();
        }
    }

    public void ResetCourse(PlaneRaceProgress progress)
    {
        if (progress == null)
        {
            return;
        }

        progress.ResetProgress();
    }

    public int GetNextCheckpointIndex(PlaneRaceProgress progress)
    {
        if (progress == null)
        {
            return 0;
        }

        return progress.NextCheckpointIndex;
    }
}
