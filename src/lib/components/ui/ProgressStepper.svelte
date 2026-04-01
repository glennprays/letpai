<script lang="ts">
  import { Check, Circle } from 'lucide-svelte';

  interface Step {
    id: number;
    label: string;
  }

  interface Props {
    steps: Step[];
    currentStep: number;
  }

  let { steps, currentStep }: Props = $props();
</script>

<div class="progress-stepper">
  {#each steps as step, index (stepId)}
    <div class="stepper-item" class:completed={index + 1 < currentStep} class:active={index + 1 === currentStep}>
      <div class="step-indicator">
        {#if index + 1 < currentStep}
          <div class="step-icon completed">
            <Check size={14} style="color: #14B8A6;" />
          </div>
        {:else if index + 1 === currentStep}
          <div class="step-number active">
            {step.id}
          </div>
        {:else}
          <div class="step-number">
            {step.id}
          </div>
        {/if}
      </div>

      <div class="step-label">
        {step.label}
      </div>

      {#if index < steps.length - 1}
        <div class="step-connector" class:filled={index + 1 < currentStep}></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .progress-stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 0;
    margin-bottom: 24px;
  }

  .stepper-item {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    position: relative;
  }

  .step-indicator {
    position: relative;
    z-index: 1;
  }

  .step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #F3F4F6;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.3s;
  }

  .step-number.active {
    background: #FF6B6B;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.35);
  }

  .step-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #DCFCE7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .step-icon.completed {
    background: #14B8A6;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
  }

  .step-label {
    font-size: 13px;
    font-weight: 600;
    color: #9CA3AF;
    transition: color 0.3s;
  }

  .stepper-item.active .step-label {
    color: #FF6B6B;
  }

  .stepper-item.completed .step-label {
    color: #14B8A6;
  }

  .step-connector {
    flex: 1;
    height: 2px;
    background: #F3F4F6;
    transition: background 0.3s;
  }

  .step-connector.filled {
    background: linear-gradient(90deg, #14B8A6, #FF6B6B);
  }

  @media (max-width: 640px) {
    .progress-stepper {
      padding: 16px 0;
      margin-bottom: 16px;
    }

    .step-label {
      font-size: 11px;
    }

    .step-number,
    .step-icon {
      width: 32px;
      height: 32px;
    }
  }
</style>
