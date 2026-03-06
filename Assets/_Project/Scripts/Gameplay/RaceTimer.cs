using UnityEngine;

/// <summary>
/// Tracks the elapsed time of the race.
/// Starts on first checkpoint pass and ends on course finish.
/// </summary>
public class RaceTimer : MonoBehaviour
{
    [SerializeField] private CheckpointManager checkpointManager;
    [SerializeField] private bool autoStartOnFirstCheckpoint = true;

    private bool isRunning;
    private bool hasStarted;
    private float elapsedTime;

    public bool IsRunning => isRunning;
    public bool HasStarted => hasStarted;
    public float ElapsedTime => elapsedTime;

    public void SetCheckpointManager(CheckpointManager manager)
    {
        if (checkpointManager == manager)
        {
            return;
        }

        if (isActiveAndEnabled && checkpointManager != null)
        {
            checkpointManager.OnCheckpointPassed -= HandleCheckpointPassed;
            checkpointManager.OnCourseFinished -= HandleCourseFinished;
        }

        checkpointManager = manager;

        if (isActiveAndEnabled && checkpointManager != null)
        {
            checkpointManager.OnCheckpointPassed += HandleCheckpointPassed;
            checkpointManager.OnCourseFinished += HandleCourseFinished;
        }
    }

    private void OnEnable()
    {
        if (checkpointManager == null)
        {
            return;
        }

        checkpointManager.OnCheckpointPassed += HandleCheckpointPassed;
        checkpointManager.OnCourseFinished += HandleCourseFinished;
    }

    private void OnDisable()
    {
        if (checkpointManager == null)
        {
            return;
        }

        checkpointManager.OnCheckpointPassed -= HandleCheckpointPassed;
        checkpointManager.OnCourseFinished -= HandleCourseFinished;
    }

    private void Update()
    {
        if (!isRunning)
        {
            return;
        }

        elapsedTime += Time.deltaTime;
    }

    private void HandleCheckpointPassed(int nextCheckpointIndex, int totalCheckpoints)
    {
        if (!autoStartOnFirstCheckpoint)
        {
            return;
        }

        if (!hasStarted && nextCheckpointIndex > 0)
        {
            StartTimer();
        }
    }

    private void HandleCourseFinished()
    {
        StopTimer();
    }

    public void StartTimer()
    {
        hasStarted = true;
        isRunning = true;
    }

    public void StopTimer()
    {
        isRunning = false;
    }

    public void ResetTimer()
    {
        isRunning = false;
        hasStarted = false;
        elapsedTime = 0f;
    }

    public string GetFormattedTime()
    {
        int minutes = Mathf.FloorToInt(elapsedTime / 60f);
        float seconds = elapsedTime % 60f;
        return string.Format("{0:00}:{1:00.00}", minutes, seconds);
    }
}
