using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Builds a complete playable MVP scene at runtime so an empty scene can be tested immediately.
/// Add this to any GameObject in a blank scene and press Play.
/// </summary>
public class SkyRunnerBootstrap : MonoBehaviour
{
    [Header("Auto Build")]
    [SerializeField] private bool buildOnAwake = true;
    [SerializeField] private bool onlyBuildIfNoPlaneExists = true;

    [Header("Course")]
    [SerializeField] private float spawnHeight = 25f;
    [SerializeField] private Vector3[] checkpointPositions =
    {
        new Vector3(0f, 25f, 80f),
        new Vector3(60f, 30f, 170f),
        new Vector3(160f, 45f, 200f),
        new Vector3(230f, 30f, 120f),
        new Vector3(200f, 20f, 20f),
        new Vector3(110f, 35f, -40f),
        new Vector3(20f, 28f, -20f),
        new Vector3(0f, 25f, 90f)
    };

    [Header("Checkpoint Visuals")]
    [SerializeField] private Vector3 checkpointScale = new Vector3(18f, 18f, 6f);

    private void Awake()
    {
        if (!buildOnAwake)
        {
            return;
        }

        if (onlyBuildIfNoPlaneExists && FindObjectOfType<PlaneController>() != null)
        {
            return;
        }

        BuildPlayableScene();
    }

    private void BuildPlayableScene()
    {
        EnsureLighting();

        PlaneConfig planeConfig = CreateRuntimePlaneConfig();
        Transform spawnPoint = CreateSpawnPoint();
        PlaneController plane = CreatePlane(spawnPoint, planeConfig, out PlaneRaceProgress progress);
        CheckpointManager checkpointManager = CreateCheckpointManager();
        RaceTimer raceTimer = CreateRaceTimer(checkpointManager);
        RespawnSystem respawnSystem = CreateRespawnSystem(plane, progress, checkpointManager, raceTimer, spawnPoint);

        List<Checkpoint> checkpoints = CreateCourse(checkpointManager);
        checkpointManager.SetCheckpoints(checkpoints);

        CreateGround();
        CreateObstacles();
        CreateCameraRig(plane);
        CreateHud(plane, progress, checkpointManager, raceTimer);

        if (respawnSystem == null)
        {
            Debug.LogWarning("SkyRunnerBootstrap: Respawn system was not created.");
        }
    }

    private void EnsureLighting()
    {
        if (FindObjectOfType<Light>() != null)
        {
            return;
        }

        GameObject lightObject = new GameObject("Directional Light");
        Light directionalLight = lightObject.AddComponent<Light>();
        directionalLight.type = LightType.Directional;
        directionalLight.intensity = 1.1f;
        lightObject.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
    }

    private PlaneConfig CreateRuntimePlaneConfig()
    {
        PlaneConfig config = ScriptableObject.CreateInstance<PlaneConfig>();
        config.name = "Runtime Plane Config";
        return config;
    }

    private Transform CreateSpawnPoint()
    {
        GameObject spawnObject = new GameObject("Spawn Point");
        spawnObject.transform.position = new Vector3(0f, spawnHeight, 0f);
        spawnObject.transform.rotation = Quaternion.LookRotation(Vector3.forward, Vector3.up);
        return spawnObject.transform;
    }

    private PlaneController CreatePlane(Transform spawnPoint, PlaneConfig config, out PlaneRaceProgress progress)
    {
        GameObject planeObject = new GameObject("Player Plane");
        planeObject.transform.SetPositionAndRotation(spawnPoint.position, spawnPoint.rotation);

        Rigidbody planeBody = planeObject.AddComponent<Rigidbody>();
        planeBody.useGravity = false;
        planeBody.drag = 1f;
        planeBody.angularDrag = 2f;
        planeBody.interpolation = RigidbodyInterpolation.Interpolate;

        BoxCollider boxCollider = planeObject.AddComponent<BoxCollider>();
        boxCollider.size = new Vector3(2.4f, 0.8f, 3.2f);

        CreatePlaneVisual(planeObject.transform);

        PlaneController planeController = planeObject.AddComponent<PlaneController>();
        planeController.SetConfig(config);

        progress = planeObject.AddComponent<PlaneRaceProgress>();
        return planeController;
    }

    private void CreatePlaneVisual(Transform planeRoot)
    {
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body";
        body.transform.SetParent(planeRoot, false);
        body.transform.localPosition = Vector3.zero;
        body.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
        body.transform.localScale = new Vector3(1.1f, 1.6f, 1.1f);
        Destroy(body.GetComponent<Collider>());

        GameObject wing = GameObject.CreatePrimitive(PrimitiveType.Cube);
        wing.name = "Wing";
        wing.transform.SetParent(planeRoot, false);
        wing.transform.localPosition = new Vector3(0f, 0f, -0.1f);
        wing.transform.localScale = new Vector3(6f, 0.15f, 1f);
        Destroy(wing.GetComponent<Collider>());

        GameObject tail = GameObject.CreatePrimitive(PrimitiveType.Cube);
        tail.name = "Tail";
        tail.transform.SetParent(planeRoot, false);
        tail.transform.localPosition = new Vector3(0f, 0.6f, -1.25f);
        tail.transform.localScale = new Vector3(0.25f, 1.1f, 0.6f);
        Destroy(tail.GetComponent<Collider>());
    }

    private CheckpointManager CreateCheckpointManager()
    {
        GameObject managerObject = new GameObject("Checkpoint Manager");
        return managerObject.AddComponent<CheckpointManager>();
    }

    private RaceTimer CreateRaceTimer(CheckpointManager checkpointManager)
    {
        GameObject timerObject = new GameObject("Race Timer");
        RaceTimer timer = timerObject.AddComponent<RaceTimer>();
        timer.SetCheckpointManager(checkpointManager);
        return timer;
    }

    private RespawnSystem CreateRespawnSystem(
        PlaneController plane,
        PlaneRaceProgress progress,
        CheckpointManager checkpointManager,
        RaceTimer raceTimer,
        Transform spawnPoint)
    {
        GameObject respawnObject = new GameObject("Respawn System");
        RespawnSystem respawnSystem = respawnObject.AddComponent<RespawnSystem>();
        respawnSystem.Configure(plane, progress, checkpointManager, raceTimer, spawnPoint);
        return respawnSystem;
    }

    private List<Checkpoint> CreateCourse(CheckpointManager checkpointManager)
    {
        List<Checkpoint> checkpoints = new List<Checkpoint>();
        GameObject root = new GameObject("Checkpoints");

        for (int i = 0; i < checkpointPositions.Length; i++)
        {
            GameObject checkpointObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
            checkpointObject.name = "Checkpoint " + i;
            checkpointObject.transform.SetParent(root.transform);
            checkpointObject.transform.position = checkpointPositions[i];
            checkpointObject.transform.localScale = checkpointScale;

            Collider checkpointCollider = checkpointObject.GetComponent<Collider>();
            checkpointCollider.isTrigger = true;

            Checkpoint checkpoint = checkpointObject.AddComponent<Checkpoint>();
            checkpoint.Configure(i, checkpointManager);
            checkpoints.Add(checkpoint);
        }

        return checkpoints;
    }

    private void CreateGround()
    {
        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Ground";
        ground.transform.position = Vector3.zero;
        ground.transform.localScale = new Vector3(8f, 1f, 8f);
    }

    private void CreateObstacles()
    {
        Vector3[] obstaclePositions =
        {
            new Vector3(40f, 12f, 120f),
            new Vector3(180f, 15f, 150f),
            new Vector3(140f, 8f, 10f)
        };

        for (int i = 0; i < obstaclePositions.Length; i++)
        {
            GameObject obstacle = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            obstacle.name = "Obstacle " + i;
            obstacle.transform.position = obstaclePositions[i];
            obstacle.transform.localScale = new Vector3(12f, 18f, 12f);
        }
    }

    private void CreateCameraRig(PlaneController plane)
    {
        Camera sceneCamera = Camera.main;
        if (sceneCamera == null)
        {
            sceneCamera = FindObjectOfType<Camera>();
        }

        GameObject cameraObject;
        if (sceneCamera == null)
        {
            cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            sceneCamera = cameraObject.AddComponent<Camera>();
        }
        else
        {
            cameraObject = sceneCamera.gameObject;
            cameraObject.name = "Main Camera";
            cameraObject.tag = "MainCamera";
        }

        sceneCamera.fieldOfView = 60f;

        AudioListener audioListener = cameraObject.GetComponent<AudioListener>();
        if (audioListener == null)
        {
            audioListener = cameraObject.AddComponent<AudioListener>();
        }

        audioListener.enabled = true;

        ChaseCamera chaseCamera = cameraObject.AddComponent<ChaseCamera>();
        chaseCamera.Configure(plane.transform, plane, sceneCamera);
    }

    private void CreateHud(
        PlaneController plane,
        PlaneRaceProgress progress,
        CheckpointManager checkpointManager,
        RaceTimer raceTimer)
    {
        GameObject canvasObject = new GameObject("HUD Canvas");
        Canvas canvas = canvasObject.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        CanvasScaler canvasScaler = canvasObject.AddComponent<CanvasScaler>();
        canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        canvasScaler.referenceResolution = new Vector2(1920f, 1080f);
        canvasObject.AddComponent<GraphicRaycaster>();

        HUDController hud = canvasObject.AddComponent<HUDController>();

        TMP_Text speedText = CreateText(canvas.transform, "Speed Text", new Vector2(20f, -20f), new Vector2(220f, 40f), TextAlignmentOptions.TopLeft);
        TMP_Text altitudeText = CreateText(canvas.transform, "Altitude Text", new Vector2(20f, -55f), new Vector2(220f, 40f), TextAlignmentOptions.TopLeft);
        TMP_Text timerText = CreateText(canvas.transform, "Timer Text", new Vector2(-20f, -20f), new Vector2(220f, 40f), TextAlignmentOptions.TopRight);
        TMP_Text checkpointText = CreateText(canvas.transform, "Checkpoint Text", new Vector2(-20f, -55f), new Vector2(240f, 40f), TextAlignmentOptions.TopRight);

        Slider boostSlider = CreateSlider(canvas.transform, "Boost Slider", new Vector2(20f, 20f), new Vector2(260f, 24f), new Color(0.2f, 0.7f, 1f));
        Slider healthSlider = CreateSlider(canvas.transform, "Health Slider", new Vector2(20f, 52f), new Vector2(260f, 24f), new Color(0.25f, 0.9f, 0.35f));

        hud.Configure(
            plane,
            progress,
            checkpointManager,
            raceTimer,
            speedText,
            altitudeText,
            timerText,
            checkpointText,
            boostSlider,
            healthSlider
        );
    }

    private TMP_Text CreateText(
        Transform parent,
        string objectName,
        Vector2 anchoredPosition,
        Vector2 size,
        TextAlignmentOptions alignment)
    {
        GameObject textObject = new GameObject(objectName);
        textObject.transform.SetParent(parent, false);

        RectTransform rectTransform = textObject.AddComponent<RectTransform>();
        rectTransform.sizeDelta = size;

        bool isLeftAligned = alignment == TextAlignmentOptions.TopLeft;
        rectTransform.anchorMin = isLeftAligned ? new Vector2(0f, 1f) : new Vector2(1f, 1f);
        rectTransform.anchorMax = rectTransform.anchorMin;
        rectTransform.pivot = isLeftAligned ? new Vector2(0f, 1f) : new Vector2(1f, 1f);
        rectTransform.anchoredPosition = anchoredPosition;

        TextMeshProUGUI text = textObject.AddComponent<TextMeshProUGUI>();
        text.fontSize = 28f;
        text.alignment = alignment;
        text.color = Color.white;
        text.text = objectName;
        return text;
    }

    private Slider CreateSlider(
        Transform parent,
        string objectName,
        Vector2 anchoredPosition,
        Vector2 size,
        Color fillColor)
    {
        GameObject sliderObject = new GameObject(objectName);
        sliderObject.transform.SetParent(parent, false);

        RectTransform sliderRect = sliderObject.AddComponent<RectTransform>();
        sliderRect.anchorMin = new Vector2(0f, 0f);
        sliderRect.anchorMax = new Vector2(0f, 0f);
        sliderRect.pivot = new Vector2(0f, 0f);
        sliderRect.anchoredPosition = anchoredPosition;
        sliderRect.sizeDelta = size;

        Image backgroundImage = sliderObject.AddComponent<Image>();
        backgroundImage.color = new Color(0f, 0f, 0f, 0.55f);

        Slider slider = sliderObject.AddComponent<Slider>();
        slider.minValue = 0f;
        slider.maxValue = 1f;
        slider.value = 1f;

        GameObject fillArea = new GameObject("Fill Area");
        fillArea.transform.SetParent(sliderObject.transform, false);
        RectTransform fillAreaRect = fillArea.AddComponent<RectTransform>();
        fillAreaRect.anchorMin = Vector2.zero;
        fillAreaRect.anchorMax = Vector2.one;
        fillAreaRect.offsetMin = new Vector2(4f, 4f);
        fillAreaRect.offsetMax = new Vector2(-4f, -4f);

        GameObject fill = new GameObject("Fill");
        fill.transform.SetParent(fillArea.transform, false);
        RectTransform fillRect = fill.AddComponent<RectTransform>();
        fillRect.anchorMin = Vector2.zero;
        fillRect.anchorMax = Vector2.one;
        fillRect.offsetMin = Vector2.zero;
        fillRect.offsetMax = Vector2.zero;

        Image fillImage = fill.AddComponent<Image>();
        fillImage.color = fillColor;

        slider.fillRect = fillRect;
        slider.targetGraphic = fillImage;
        slider.direction = Slider.Direction.LeftToRight;

        return slider;
    }
}
