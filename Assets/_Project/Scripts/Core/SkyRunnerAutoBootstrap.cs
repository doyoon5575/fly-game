using UnityEngine;

/// <summary>
/// Ensures the demo bootstrap exists when entering play mode in an empty scene.
/// This removes the need to manually place a bootstrap object before testing.
/// </summary>
public static class SkyRunnerAutoBootstrap
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void EnsureBootstrapExists()
    {
        if (Object.FindObjectOfType<PlaneController>() != null)
        {
            return;
        }

        if (Object.FindObjectOfType<SkyRunnerBootstrap>() != null)
        {
            return;
        }

        GameObject bootstrapObject = new GameObject("SkyRunner Bootstrap");
        bootstrapObject.AddComponent<SkyRunnerBootstrap>();
    }
}
