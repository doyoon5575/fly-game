using UnityEngine;

/// <summary>
/// Resets the plane position and related runtime state.
/// </summary>
public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private PlaneController plane;
    [SerializeField] private PlaneRaceProgress progress;
    [SerializeField] private CheckpointManager checkpointManager;
    [SerializeField] private RaceTimer raceTimer;

    [Header("Spawn")]
    [SerializeField] private Transform spawnPoint;

    [Header("Behavior")]
    [SerializeField] private bool resetRaceOnRespawn = true;
    [SerializeField] private KeyCode manualRespawnKey = KeyCode.R;

    public void Configure(
        PlaneController targetPlane,
        PlaneRaceProgress raceProgress,
        CheckpointManager manager,
        RaceTimer timer,
        Transform respawnPoint)
    {
        plane = targetPlane;
        progress = raceProgress;
        checkpointManager = manager;
        raceTimer = timer;
        spawnPoint = respawnPoint;
    }

    private void Update()
    {
        if (Input.GetKeyDown(manualRespawnKey))
        {
            Respawn();
            return;
        }

        if (plane != null && plane.IsDestroyed())
        {
            Respawn();
        }
    }

    public void Respawn()
    {
        if (plane == null || spawnPoint == null)
        {
            Debug.LogWarning("RespawnSystem: Missing plane or spawnPoint reference.");
            return;
        }

        plane.transform.SetPositionAndRotation(spawnPoint.position, spawnPoint.rotation);
        plane.StopMotion();
        plane.RestoreFullState();

        if (!resetRaceOnRespawn)
        {
            return;
        }

        if (checkpointManager != null && progress != null)
        {
            checkpointManager.ResetCourse(progress);
        }

        if (raceTimer != null)
        {
            raceTimer.ResetTimer();
        }
    }
}
