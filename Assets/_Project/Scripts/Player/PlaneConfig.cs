using UnityEngine;

[CreateAssetMenu(fileName = "PlaneConfig", menuName = "SkyRunner/Plane Config")]
public class PlaneConfig : ScriptableObject
{
    [Header("Speed")]
    public float minSpeed = 40f;
    public float maxSpeed = 180f;
    public float startSpeed = 80f;
    public float acceleration = 30f;
    public float deceleration = 20f;

    [Header("Rotation")]
    public float pitchSpeed = 60f;
    public float yawSpeed = 45f;
    public float rollSpeed = 80f;
    public float autoLevelStrength = 2f;

    [Header("Boost")]
    public float boostMultiplier = 1.5f;
    public float maxBoost = 100f;
    public float boostDrainPerSecond = 25f;
    public float boostRechargePerSecond = 15f;

    [Header("Health")]
    public float maxHealth = 100f;
    public float collisionDamage = 20f;
}
