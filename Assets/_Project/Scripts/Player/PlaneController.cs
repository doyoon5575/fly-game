using UnityEngine;

/// <summary>
/// Arcade-style plane controller for a 3D flight prototype.
/// Prioritizes readable controls and tunable handling over realism.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
public class PlaneController : MonoBehaviour
{
    [Header("Config")]
    [SerializeField] private PlaneConfig config;

    [Header("Runtime State")]
    [SerializeField] private float currentSpeed;
    [SerializeField] private float currentBoost;
    [SerializeField] private float currentHealth;

    [Header("Debug")]
    [SerializeField] private bool lockCursorOnPlay;

    private Rigidbody rb;

    private float throttleInput;
    private float pitchInput;
    private float yawInput;
    private float rollInput;
    private bool boostInput;

    public float CurrentSpeed => currentSpeed;
    public float CurrentBoost => currentBoost;
    public float CurrentHealth => currentHealth;
    public float Altitude => transform.position.y;

    public float BoostNormalized
    {
        get
        {
            if (config == null || config.maxBoost <= 0f)
            {
                return 0f;
            }

            return currentBoost / config.maxBoost;
        }
    }

    public float HealthNormalized
    {
        get
        {
            if (config == null || config.maxHealth <= 0f)
            {
                return 0f;
            }

            return currentHealth / config.maxHealth;
        }
    }

    public bool IsBoosting => boostInput && currentBoost > 0f;

    public void SetConfig(PlaneConfig planeConfig)
    {
        config = planeConfig;
    }

    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }

    private void Start()
    {
        if (config == null)
        {
            Debug.LogError("PlaneController: PlaneConfig is not assigned.");
            enabled = false;
            return;
        }

        rb.useGravity = false;
        rb.drag = 1f;
        rb.angularDrag = 2f;
        rb.interpolation = RigidbodyInterpolation.Interpolate;

        currentSpeed = Mathf.Clamp(config.startSpeed, config.minSpeed, config.maxSpeed);
        currentBoost = config.maxBoost;
        currentHealth = config.maxHealth;

        if (lockCursorOnPlay)
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }
    }

    private void Update()
    {
        ReadInput();
        UpdateSpeed();
        UpdateBoost();
    }

    private void FixedUpdate()
    {
        if (config == null)
        {
            return;
        }

        ApplyRotation();
        ApplyMovement();
    }

    private void ReadInput()
    {
        throttleInput = Input.GetAxis("Vertical");
        yawInput = Input.GetAxis("Horizontal");

        pitchInput = 0f;
        if (Input.GetKey(KeyCode.UpArrow))
        {
            pitchInput = 1f;
        }
        else if (Input.GetKey(KeyCode.DownArrow))
        {
            pitchInput = -1f;
        }

        rollInput = 0f;
        if (Input.GetKey(KeyCode.Q))
        {
            rollInput = 1f;
        }
        else if (Input.GetKey(KeyCode.E))
        {
            rollInput = -1f;
        }

        boostInput = Input.GetKey(KeyCode.LeftShift);
    }

    private void UpdateSpeed()
    {
        if (throttleInput > 0f)
        {
            currentSpeed += config.acceleration * throttleInput * Time.deltaTime;
        }
        else if (throttleInput < 0f)
        {
            currentSpeed += config.deceleration * throttleInput * Time.deltaTime;
        }

        currentSpeed = Mathf.Clamp(currentSpeed, config.minSpeed, config.maxSpeed);
    }

    private void UpdateBoost()
    {
        if (IsBoosting)
        {
            currentBoost -= config.boostDrainPerSecond * Time.deltaTime;
            currentBoost = Mathf.Max(currentBoost, 0f);
        }
        else
        {
            currentBoost += config.boostRechargePerSecond * Time.deltaTime;
            currentBoost = Mathf.Min(currentBoost, config.maxBoost);
        }
    }

    private void ApplyRotation()
    {
        float dt = Time.fixedDeltaTime;
        Quaternion targetRotation = rb.rotation;

        Quaternion pitchRotation = Quaternion.AngleAxis(pitchInput * config.pitchSpeed * dt, transform.right);
        Quaternion yawRotation = Quaternion.AngleAxis(yawInput * config.yawSpeed * dt, transform.up);
        Quaternion rollRotation = Quaternion.AngleAxis(-rollInput * config.rollSpeed * dt, transform.forward);

        targetRotation *= yawRotation * pitchRotation * rollRotation;

        Vector3 localEulerAngles = transform.localEulerAngles;
        float zAngle = localEulerAngles.z;

        if (zAngle > 180f)
        {
            zAngle -= 360f;
        }

        if (Mathf.Abs(rollInput) <= 0.01f)
        {
            float levelAdjustment = -zAngle * config.autoLevelStrength * dt;
            Quaternion autoLevelRotation = Quaternion.AngleAxis(levelAdjustment, transform.forward);
            targetRotation *= autoLevelRotation;
        }

        rb.MoveRotation(targetRotation);
    }

    private void ApplyMovement()
    {
        float appliedSpeed = currentSpeed;

        if (IsBoosting)
        {
            appliedSpeed *= config.boostMultiplier;
        }

        rb.velocity = transform.forward * appliedSpeed;
    }

    private void OnCollisionEnter(Collision collision)
    {
        if (config == null)
        {
            return;
        }

        TakeDamage(config.collisionDamage);
        currentSpeed *= 0.6f;
    }

    public void TakeDamage(float amount)
    {
        currentHealth -= amount;
        currentHealth = Mathf.Max(currentHealth, 0f);
    }

    public bool IsDestroyed()
    {
        return currentHealth <= 0f;
    }

    public void RestoreFullState()
    {
        if (config == null)
        {
            return;
        }

        currentSpeed = Mathf.Clamp(config.startSpeed, config.minSpeed, config.maxSpeed);
        currentBoost = config.maxBoost;
        currentHealth = config.maxHealth;
    }

    public void StopMotion()
    {
        rb.velocity = Vector3.zero;
        rb.angularVelocity = Vector3.zero;
    }
}
