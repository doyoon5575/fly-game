using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Updates the main flight HUD from gameplay systems.
/// </summary>
public class HUDController : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private PlaneController plane;
    [SerializeField] private PlaneRaceProgress progress;
    [SerializeField] private CheckpointManager checkpointManager;
    [SerializeField] private RaceTimer raceTimer;

    [Header("Text")]
    [SerializeField] private TMP_Text speedText;
    [SerializeField] private TMP_Text altitudeText;
    [SerializeField] private TMP_Text timerText;
    [SerializeField] private TMP_Text checkpointText;

    [Header("Bars")]
    [SerializeField] private Slider boostSlider;
    [SerializeField] private Slider healthSlider;

    public void Configure(
        PlaneController targetPlane,
        PlaneRaceProgress raceProgress,
        CheckpointManager manager,
        RaceTimer timer,
        TMP_Text speedLabel,
        TMP_Text altitudeLabel,
        TMP_Text timerLabel,
        TMP_Text checkpointLabel,
        Slider boostBar,
        Slider healthBar)
    {
        plane = targetPlane;
        progress = raceProgress;
        checkpointManager = manager;
        raceTimer = timer;
        speedText = speedLabel;
        altitudeText = altitudeLabel;
        timerText = timerLabel;
        checkpointText = checkpointLabel;
        boostSlider = boostBar;
        healthSlider = healthBar;
    }

    private void Update()
    {
        if (plane != null)
        {
            UpdatePlaneHud();
        }

        if (raceTimer != null && timerText != null)
        {
            timerText.text = raceTimer.GetFormattedTime();
        }

        if (progress != null && checkpointManager != null && checkpointText != null)
        {
            checkpointText.text = string.Format(
                "CP {0}/{1}",
                progress.NextCheckpointIndex,
                checkpointManager.TotalCheckpoints
            );
        }
    }

    private void UpdatePlaneHud()
    {
        if (speedText != null)
        {
            speedText.text = string.Format("SPD {0:0}", plane.CurrentSpeed);
        }

        if (altitudeText != null)
        {
            altitudeText.text = string.Format("ALT {0:0}", plane.Altitude);
        }

        if (boostSlider != null)
        {
            boostSlider.value = plane.BoostNormalized;
        }

        if (healthSlider != null)
        {
            healthSlider.value = plane.HealthNormalized;
        }
    }
}
