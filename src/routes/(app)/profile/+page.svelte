<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { updateProfile } from '$lib/services/auth';
  import { getAvatarWithFallback, getDisplayName } from '$lib/utils/avatar';
  import { ArrowLeft } from 'lucide-svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let isReady = $state(false);
  let initialized = $state(false);

  let fullName = $state('');
  let originalFullName = $state('');
  let isSaving = $state(false);
  let error = $state('');

  $effect(() => {
    if (!initialized && $auth.user?.user_id) {
      const newName = $auth.user.full_name || '';
      fullName = newName;
      originalFullName = newName;
      isReady = true;
      initialized = true;
    }
  });

  function hasChanges(): boolean {
    return fullName !== originalFullName;
  }

  function handleCancel() {
    fullName = originalFullName;
    error = '';
  }

  async function handleSave() {
    if (!fullName.trim()) {
      error = 'Name is required';
      return;
    }

    if (fullName.trim().length > 100) {
      error = 'Name must be less than 100 characters';
      return;
    }

    isSaving = true;
    error = '';

    const wasFirstCompletion = originalFullName === '';
    try {
      await updateProfile({ full_name: fullName.trim() });
      originalFullName = fullName;
      if (wasFirstCompletion) {
        await goto('/dashboard');
        return;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update profile';
    } finally {
      isSaving = false;
    }
  }

  function goBack() {
    goto('/dashboard');
  }
</script>

<div class="profile-container">
  <!-- Back Button -->
  <button class="back-button" onclick={goBack}>
    <ArrowLeft size={20} />
    <span>Back</span>
  </button>

  <!-- Profile Card -->
  <div class="profile-card">
    <h1 class="profile-title">Profile</h1>

    {#if !fullName && isReady}
      <div class="profile-warning">
        <p>Please complete your profile to continue</p>
      </div>
    {/if}

    <!-- Avatar -->
    <div class="avatar-section">
      {#if isReady && $auth.user}
        <img
          src={getAvatarWithFallback(
            $auth.user.avatar_url,
            $auth.user.full_name,
            $auth.user.whatsapp_number,
            $auth.user.user_id,
            100
          )}
          alt={getDisplayName($auth.user.full_name, $auth.user.whatsapp_number)}
          class="avatar"
        />
      {:else}
        <!-- Loading placeholder -->
        <div class="avatar avatar-placeholder"></div>
      {/if}
    </div>

    <!-- Form -->
    {#if isReady && $auth.user}
      <form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <!-- Full Name -->
        <div class="field-group">
          <Input
            id="full_name"
            name="full_name"
            type="text"
            label="Full Name"
            bind:value={fullName}
            placeholder="Enter your full name"
            disabled={isSaving}
            error={!!error}
            errorText={error}
            maxLength={100}
            showCount={true}
          />
        </div>

        <!-- Phone Number (Read-only) -->
        <div class="field-group">
          <label for="phone" class="field-label">WhatsApp Number</label>
          <input
            id="phone"
            type="text"
            value={$auth.user.whatsapp_number}
            disabled
            class="phone-display"
          />
          <p class="field-helper">Your phone number cannot be changed</p>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <Button
            type="button"
            variant="ghost"
            onclick={handleCancel}
            disabled={isSaving || !hasChanges()}
            class="!bg-[#f5dddb] !text-[#584140] hover:!bg-[#efd0ce]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={!hasChanges()}
          >
            Save Changes
          </Button>
        </div>
      </form>
    {:else}
      <!-- Form loading placeholder -->
      <div class="form-placeholder">
        <div class="placeholder-field"></div>
        <div class="placeholder-field"></div>
        <div class="placeholder-field"></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-container {
    min-height: 100vh;
    background: #fff8f7;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back-button {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #584140;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px;
    margin-bottom: 24px;
    border-radius: 8px;
    transition: background-color 0.15s;
  }

  .back-button:hover {
    background: #f5dddb;
  }

  .profile-card {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(37, 24, 24, 0.04);
  }

  .profile-title {
    font-size: 24px;
    font-weight: 600;
    color: #251818;
    text-align: center;
    margin-bottom: 24px;
  }

  .profile-warning {
    background: #FEF3C7;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 24px;
    text-align: center;
  }

  .profile-warning p {
    margin: 0;
    font-size: 14px;
    color: #92400E;
    font-weight: 500;
  }

  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f5dddb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .avatar-placeholder {
    background: #f5dddb;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .field-group {
    margin-bottom: 24px;
  }

  .field-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #584140;
    margin-bottom: 8px;
  }

  .phone-display {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    background: #f5dddb;
    color: #584140;
    font-size: 15px;
    font-family: inherit;
    cursor: not-allowed;
  }

  .field-helper {
    font-size: 13px;
    color: #584140;
    margin-top: 6px;
    margin-bottom: 0;
  }

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }

  .button-group :global(button) {
    flex: 1;
  }

  .form-placeholder {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .placeholder-field {
    height: 48px;
    background: #f5dddb;
    border-radius: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @media (max-width: 640px) {
    .profile-container {
      padding: 16px;
    }

    .profile-card {
      padding: 24px;
    }

    .profile-title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 80px;
      height: 80px;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>
