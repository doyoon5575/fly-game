using UnityEngine;

/// <summary>
/// Smooth chase camera for the arcade plane.
/// Keeps a stable view and increases FOV during boost.
/// </summary>
public class ChaseCamera : MonoBehaviour
{
    [SerializeField] private Transform target;
    [SerializeField] private PlaneController plane;
    [SerializeField] private Camera targetCamera;

    [Header("Follow")]
    [SerializeField] private Vector3 followOffset = new Vector3(0f, 3f, -10f);
    [SerializeField] private float followSmoothTime = 0.18f;
    [SerializeField] private float rotationSmoothSpeed = 5f;
    [SerializeField] private bool useWorldUp = true;

    [Header("Look Ahead")]
    [SerializeField] private float forwardLookDistance = 8f;

    [Header("Field Of View")]
    [SerializeField] private float normalFOV = 60f;
    [SerializeField] private float boostFOV = 75f;
    [SerializeField] private float fovLerpSpeed = 4f;

    private Vector3 followVelocity;

    public void Configure(Transform followTarget, PlaneController targetPlane, Camera followCamera)
    {
        target = followTarget;
        plane = targetPlane;
        targetCamera = followCamera;
    }

    private void LateUpdate()
    {
        if (target == null || plane == null || targetCamera == null)
        {
            return;
        }

        UpdatePosition();
        UpdateRotation();
        UpdateFOV();
    }

    private void UpdatePosition()
    {
        Vector3 desiredPosition = target.TransformPoint(followOffset);

        transform.position = Vector3.SmoothDamp(
            transform.position,
            desiredPosition,
            ref followVelocity,
            followSmoothTime
        );
    }

    private void UpdateRotation()
    {
        Vector3 lookTarget = target.position + target.forward * forwardLookDistance;
        Vector3 direction = (lookTarget - transform.position).normalized;

        if (direction.sqrMagnitude < 0.0001f)
        {
            return;
        }

        Vector3 upVector = useWorldUp ? Vector3.up : target.up;
        Quaternion desiredRotation = Quaternion.LookRotation(direction, upVector);

        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            desiredRotation,
            rotationSmoothSpeed * Time.deltaTime
        );
    }

    private void UpdateFOV()
    {
        float targetFov = plane.IsBoosting ? boostFOV : normalFOV;
        targetCamera.fieldOfView = Mathf.Lerp(
            targetCamera.fieldOfView,
            targetFov,
            fovLerpSpeed * Time.deltaTime
        );
    }
}
