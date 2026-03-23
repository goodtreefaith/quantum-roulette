import type { Roulette } from './roulette';
import options from './options';
import type { PerformanceMonitor } from './utils/performance';
import { PerformanceUtils } from './utils/performance';
import {
  normalizeParticipantInput,
  parseParticipantInput,
  removeWinnerFromInput,
} from './utils/participants';

const NAMES_STORAGE_KEY = 'mbr_names';
const NOTICE_STORAGE_KEY = 'lastViewedNotification';
const CURRENT_NOTICE = 1;
const ANALYTICS_ID = 'G-5899C1DJM0';

type WinnerType = 'first' | 'last' | 'custom';

type AppElements = {
  settingsPanel: HTMLElement;
  settingsHeader: HTMLElement;
  namesInput: HTMLTextAreaElement;
  participantSummary: HTMLElement;
  participantValidation: HTMLElement;
  statusIndicator: HTMLElement;
  btnNotice: HTMLButtonElement;
  btnShuffle: HTMLButtonElement;
  btnStart: HTMLButtonElement;
  mapSelector: HTMLSelectElement;
  autoRecordingToggle: HTMLInputElement;
  skillToggle: HTMLInputElement;
  firstWinnerButton: HTMLButtonElement;
  lastWinnerButton: HTMLButtonElement;
  rankInput: HTMLInputElement;
  rankHelp: HTMLElement;
  advancedButton: HTMLButtonElement;
  advancedModal: HTMLElement;
  advancedBackdrop: HTMLElement;
  closeAdvancedButton: HTMLButtonElement;
  resetSettingsButton: HTMLButtonElement;
  performanceMode: HTMLSelectElement;
  particleCount: HTMLSelectElement;
  showFpsToggle: HTMLInputElement;
  advancedStatsToggle: HTMLInputElement;
  animationsToggle: HTMLInputElement;
  soundEffectsToggle: HTMLInputElement;
  hapticFeedbackToggle: HTMLInputElement;
  glowIntensity: HTMLInputElement;
  transparency: HTMLInputElement;
  cameraSmoothing: HTMLInputElement;
  zoomSensitivity: HTMLInputElement;
  autoSaveToggle: HTMLInputElement;
  showWinnerModalToggle: HTMLInputElement;
  autoRemoveWinnerToggle: HTMLInputElement;
  inGameControls: HTMLElement;
  shakeButton: HTMLButtonElement;
  notice: HTMLElement;
  closeNotice: HTMLButtonElement;
  winnerModal: HTMLElement;
  winnerName: HTMLElement;
  removeWinnerButton: HTMLButtonElement;
  keepWinnerButton: HTMLButtonElement;
  continueButton: HTMLButtonElement;
  root: HTMLElement;
};

function queryElement<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T | null {
  return parent.querySelector(selector) as T | null;
}

function requireElement<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const element = queryElement<T>(selector, parent);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to write localStorage key "${key}":`, error);
  }
}

function setPressedState(element: HTMLButtonElement, isPressed: boolean): void {
  element.setAttribute('aria-pressed', String(isPressed));
  element.classList.toggle('active', isPressed);
}

function setToggleState(toggle: HTMLInputElement, value: boolean): void {
  toggle.checked = value;
  toggle.setAttribute('aria-checked', String(value));
}

function setHidden(element: HTMLElement, hidden: boolean, displayValue = 'block'): void {
  element.style.display = hidden ? 'none' : displayValue;
  element.setAttribute('aria-hidden', String(hidden));
}

function createGtagProxy(): void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_ID);
}

async function waitForRoulette(roulette: Roulette): Promise<void> {
  if (roulette.isReady) {
    return;
  }

  await new Promise<void>((resolve) => {
    const poll = () => {
      if (roulette.isReady) {
        resolve();
        return;
      }
      window.setTimeout(poll, 100);
    };
    poll();
  });
}

class RouletteUIController {
  private readonly elements: AppElements;
  private readonly roulette: Roulette;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly refreshParticipantsDebounced: () => void;

  private ready = false;
  private winnerType: WinnerType = 'first';
  private lastWinnerName = '';
  private lastFocusedElement: HTMLElement | null = null;

  constructor(
    roulette: Roulette,
    performanceMonitor: PerformanceMonitor,
    elements: AppElements,
  ) {
    this.roulette = roulette;
    this.performanceMonitor = performanceMonitor;
    this.elements = elements;
    this.refreshParticipantsDebounced = PerformanceUtils.debounce(() => {
      this.refreshParticipants();
    }, 150);
  }

  async init(): Promise<void> {
    await waitForRoulette(this.roulette);
    createGtagProxy();
    this.loadSavedNames();
    this.populateMaps();
    this.applySettingsToControls();
    this.applySettingsToRuntime();
    this.bindEvents();
    this.refreshParticipants();
    this.updateNoticeVisibility();
    this.updateSettingsHeaderState();
  }

  private bindEvents(): void {
    const {
      namesInput,
      btnShuffle,
      btnStart,
      btnNotice,
      closeNotice,
      mapSelector,
      autoRecordingToggle,
      skillToggle,
      rankInput,
      firstWinnerButton,
      lastWinnerButton,
      shakeButton,
      settingsHeader,
      advancedButton,
      closeAdvancedButton,
      resetSettingsButton,
      advancedBackdrop,
      performanceMode,
      particleCount,
      showFpsToggle,
      advancedStatsToggle,
      animationsToggle,
      soundEffectsToggle,
      hapticFeedbackToggle,
      glowIntensity,
      transparency,
      cameraSmoothing,
      zoomSensitivity,
      autoSaveToggle,
      showWinnerModalToggle,
      autoRemoveWinnerToggle,
      removeWinnerButton,
      keepWinnerButton,
      continueButton,
      winnerModal,
    } = this.elements;

    namesInput.addEventListener('input', () => {
      this.refreshParticipantsDebounced();
    });

    namesInput.addEventListener('blur', () => {
      const normalized = normalizeParticipantInput(namesInput.value);
      if (normalized && normalized !== namesInput.value.trim()) {
        namesInput.value = normalized;
      }
      this.refreshParticipants();
    });

    btnShuffle.addEventListener('click', () => {
      this.refreshParticipants();
      this.animateButton(btnShuffle);
    });

    btnStart.addEventListener('click', () => {
      if (!this.ready) {
        return;
      }

      this.trackEvent('start', this.roulette.getCount());
      this.roulette.start();
      this.minimizeSettingsPanel();
      this.animateButton(btnStart);
    });

    btnNotice.addEventListener('click', () => {
      this.openNotice();
      this.animateButton(btnNotice);
    });

    closeNotice.addEventListener('click', () => {
      this.closeNotice();
      this.animateButton(closeNotice);
    });

    mapSelector.addEventListener('change', () => {
      this.roulette.setMap(Number(mapSelector.value));
      mapSelector.style.borderColor = 'var(--neon-cyan)';
      window.setTimeout(() => {
        mapSelector.style.borderColor = '';
      }, 600);
    });

    autoRecordingToggle.addEventListener('change', () => {
      options.autoRecording = autoRecordingToggle.checked;
      this.applySettingsToRuntime();
    });

    skillToggle.addEventListener('change', () => {
      options.useSkills = skillToggle.checked;
      this.applySettingsToRuntime();
      this.refreshParticipants();
    });

    rankInput.addEventListener('change', () => {
      this.winnerType = 'custom';
      this.applyWinnerRank(Number(rankInput.value));
      this.updateWinnerControls();
    });

    firstWinnerButton.addEventListener('click', () => {
      this.winnerType = 'first';
      this.applyWinnerRank(1);
      this.updateWinnerControls();
    });

    lastWinnerButton.addEventListener('click', () => {
      this.winnerType = 'last';
      this.applyWinnerRank(this.getParticipantCount() || 1);
      this.updateWinnerControls();
    });

    shakeButton.addEventListener('click', () => {
      this.roulette.shake();
      this.trackEvent('shake', 1);
      this.animateButton(shakeButton);
    });

    settingsHeader.addEventListener('click', () => {
      this.elements.settingsPanel.classList.toggle('minimized');
      this.updateSettingsHeaderState();
    });

    settingsHeader.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.elements.settingsPanel.classList.toggle('minimized');
        this.updateSettingsHeaderState();
      }
    });

    advancedButton.addEventListener('click', () => {
      this.openAdvancedSettings();
      this.animateButton(advancedButton);
    });

    closeAdvancedButton.addEventListener('click', () => {
      this.saveAdvancedSettings();
      this.closeAdvancedSettings();
      this.animateButton(closeAdvancedButton);
    });

    resetSettingsButton.addEventListener('click', () => {
      options.resetToDefaults();
      this.applySettingsToControls();
      this.applySettingsToRuntime();
      this.refreshParticipants();
      this.animateButton(resetSettingsButton);
    });

    advancedBackdrop.addEventListener('click', () => {
      this.closeAdvancedSettings();
    });

    [performanceMode, particleCount].forEach((select) => {
      select.addEventListener('change', () => this.previewAdvancedSettings());
    });

    [
      showFpsToggle,
      advancedStatsToggle,
      animationsToggle,
      soundEffectsToggle,
      hapticFeedbackToggle,
      autoSaveToggle,
      showWinnerModalToggle,
      autoRemoveWinnerToggle,
    ].forEach((toggle) => {
      toggle.addEventListener('change', () => this.previewAdvancedSettings());
    });

    [glowIntensity, transparency, cameraSmoothing, zoomSensitivity].forEach(
      (input) => {
        input.addEventListener('input', () => this.previewAdvancedSettings());
      },
    );

    removeWinnerButton.addEventListener('click', () => {
      this.handleWinnerAction('remove');
    });

    keepWinnerButton.addEventListener('click', () => {
      this.handleWinnerAction('keep');
    });

    continueButton.addEventListener('click', () => {
      this.handleWinnerAction('continue');
    });

    winnerModal.addEventListener('click', (event) => {
      if (event.target === winnerModal) {
        this.closeWinnerModal();
        this.restoreSettingsPanel();
      }
    });

    this.roulette.addEventListener('goal', (event: Event) => {
      const customEvent = event as CustomEvent<{ winner: string }>;
      this.handleGoal(customEvent.detail.winner);
    });

    this.roulette.addEventListener('shakeAvailableChanged', (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      this.updateShakeAvailability(customEvent.detail);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (this.elements.advancedModal.style.display !== 'none') {
        this.closeAdvancedSettings();
        return;
      }

      if (this.elements.winnerModal.style.display !== 'none') {
        this.closeWinnerModal();
        this.restoreSettingsPanel();
        return;
      }

      if (this.elements.notice.style.display !== 'none') {
        this.closeNotice();
      }
    });
  }

  private loadSavedNames(): void {
    const savedNames = safeLocalStorageGet(NAMES_STORAGE_KEY);
    if (savedNames) {
      this.elements.namesInput.value = savedNames;
    }
  }

  private populateMaps(): void {
    this.elements.mapSelector.innerHTML = '';
    this.roulette.getMaps().forEach((map) => {
      const option = document.createElement('option');
      option.value = String(map.index);
      option.textContent = map.title;
      option.setAttribute('data-trans', '');
      window.translateElement(option);
      this.elements.mapSelector.append(option);
    });
  }

  private applySettingsToControls(): void {
    setToggleState(this.elements.autoRecordingToggle, options.autoRecording);
    setToggleState(this.elements.skillToggle, options.useSkills);
    setToggleState(this.elements.showFpsToggle, options.showFPS);
    setToggleState(this.elements.advancedStatsToggle, options.showAdvancedStats);
    setToggleState(this.elements.animationsToggle, options.enableAnimations);
    setToggleState(this.elements.soundEffectsToggle, options.enableSoundEffects);
    setToggleState(this.elements.hapticFeedbackToggle, options.enableHapticFeedback);
    setToggleState(this.elements.autoSaveToggle, options.autoSaveResults);
    setToggleState(this.elements.showWinnerModalToggle, options.showWinnerModal);
    setToggleState(this.elements.autoRemoveWinnerToggle, options.autoRemoveWinner);

    this.elements.performanceMode.value = options.performanceMode;
    this.elements.particleCount.value = options.particleCount;
    this.elements.glowIntensity.value = String(options.glowIntensity);
    this.elements.transparency.value = String(options.transparency);
    this.elements.cameraSmoothing.value = String(options.cameraSmoothing);
    this.elements.zoomSensitivity.value = String(options.zoomSensitivity);

    if (options.winningRank === 0) {
      this.winnerType = 'first';
    } else {
      this.winnerType = 'custom';
    }
  }

  private applySettingsToRuntime(): void {
    this.performanceMonitor.showFPS(options.showFPS);
    this.performanceMonitor.showDetailed(options.showAdvancedStats);
    this.roulette.setAutoRecording(options.autoRecording);
    this.roulette.setUpdateInterval(options.updateInterval);
    this.roulette.setParticleMultiplier(options.particleMultiplier);
    this.roulette.setCameraSettings(
      options.cameraSmoothing,
      options.zoomSensitivity,
    );
    this.applyVisualPreferences(
      options.transparency,
      options.glowIntensity,
      options.enableAnimations,
    );
  }

  private applyVisualPreferences(
    transparency: number,
    glowIntensity: number,
    enableAnimations: boolean,
  ): void {
    this.elements.root.style.setProperty(
      '--glass-bg',
      `rgba(255, 255, 255, ${transparency * 0.1})`,
    );
    this.elements.root.style.setProperty(
      '--panel-brightness',
      `${Math.max(0.5, glowIntensity)}`,
    );
    this.elements.root.classList.toggle('reduced-motion', !enableAnimations);
  }

  private previewAdvancedSettings(): void {
    this.applyVisualPreferences(
      Number(this.elements.transparency.value),
      Number(this.elements.glowIntensity.value),
      this.elements.animationsToggle.checked,
    );
  }

  private saveAdvancedSettings(): void {
    options.performanceMode = this.elements.performanceMode.value as typeof options.performanceMode;
    options.particleCount = this.elements.particleCount.value as typeof options.particleCount;
    options.showFPS = this.elements.showFpsToggle.checked;
    options.showAdvancedStats = this.elements.advancedStatsToggle.checked;
    options.enableAnimations = this.elements.animationsToggle.checked;
    options.enableSoundEffects = this.elements.soundEffectsToggle.checked;
    options.enableHapticFeedback = this.elements.hapticFeedbackToggle.checked;
    options.glowIntensity = Number(this.elements.glowIntensity.value);
    options.transparency = Number(this.elements.transparency.value);
    options.cameraSmoothing = Number(this.elements.cameraSmoothing.value);
    options.zoomSensitivity = Number(this.elements.zoomSensitivity.value);
    options.autoSaveResults = this.elements.autoSaveToggle.checked;
    options.showWinnerModal = this.elements.showWinnerModalToggle.checked;
    options.autoRemoveWinner = this.elements.autoRemoveWinnerToggle.checked;
    this.applySettingsToRuntime();
  }

  private refreshParticipants(): void {
    const parsed = parseParticipantInput(this.elements.namesInput.value);
    const totalParticipants = parsed.totalParticipants;
    const hasErrors = parsed.invalidTokens.length > 0;
    const hasParticipants = totalParticipants > 0;

    if (hasErrors) {
      this.elements.participantValidation.textContent =
        'Check weighted/count syntax. Every entry must use positive numbers.';
    } else if (!hasParticipants) {
      this.elements.participantValidation.textContent =
        'Add at least one participant to start the roulette.';
    } else {
      this.elements.participantValidation.textContent = '';
    }

    this.elements.participantSummary.textContent = hasParticipants
      ? `${parsed.entries.length} entries • ${totalParticipants} marbles ready`
      : 'No participants ready yet';

    this.ready = hasParticipants && !hasErrors;
    this.elements.btnStart.disabled = !this.ready;
    this.elements.statusIndicator.classList.toggle('active', this.ready);
    this.elements.statusIndicator.classList.toggle('inactive', !this.ready);

    safeLocalStorageSet(NAMES_STORAGE_KEY, this.elements.namesInput.value.trim());

    const nextNames = parsed.entries.reduce<string[]>((acc, entry) => {
      const marbleName = entry.weight > 1 ? `${entry.name}/${entry.weight}` : entry.name;
      for (let index = 0; index < entry.count; index++) {
        acc.push(marbleName);
      }
      return acc;
    }, []);
    this.roulette.setMarbles(nextNames);

    this.syncWinnerRank(totalParticipants);
  }

  private syncWinnerRank(totalParticipants: number): void {
    const maxRank = Math.max(1, totalParticipants);
    this.elements.rankInput.min = '1';
    this.elements.rankInput.max = String(maxRank);

    if (this.winnerType === 'first') {
      this.applyWinnerRank(1);
    } else if (this.winnerType === 'last') {
      this.applyWinnerRank(maxRank);
    } else {
      const currentRank = Number(this.elements.rankInput.value || 1);
      this.applyWinnerRank(Math.min(maxRank, Math.max(1, currentRank)));
    }

    this.elements.rankHelp.textContent = totalParticipants
      ? `Winner rank must be between 1 and ${maxRank}.`
      : 'Winner rank will unlock once participants are added.';
    this.updateWinnerControls();
  }

  private applyWinnerRank(rank: number): void {
    const maxRank = Math.max(1, this.getParticipantCount());
    const safeRank = Math.min(maxRank, Math.max(1, Math.floor(rank)));
    this.elements.rankInput.value = String(safeRank);
    options.winningRank = safeRank - 1;
    this.roulette.setWinningRank(options.winningRank);
  }

  private updateWinnerControls(): void {
    const isCustom = this.winnerType === 'custom';
    setPressedState(this.elements.firstWinnerButton, this.winnerType === 'first');
    setPressedState(this.elements.lastWinnerButton, this.winnerType === 'last');
    this.elements.rankInput.classList.toggle('active', isCustom);
    this.elements.rankInput.setAttribute('aria-invalid', String(!this.ready));
  }

  private getParticipantCount(): number {
    return parseParticipantInput(this.elements.namesInput.value).totalParticipants;
  }

  private updateShakeAvailability(isAvailable: boolean): void {
    this.elements.inGameControls.classList.toggle('hide', !isAvailable);
    this.elements.shakeButton.disabled = !isAvailable;
    this.elements.shakeButton.setAttribute('aria-disabled', String(!isAvailable));
  }

  private handleGoal(winnerName: string): void {
    this.ready = false;
    this.lastWinnerName = winnerName;
    this.elements.btnStart.disabled = true;

    window.setTimeout(() => {
      if (options.autoRemoveWinner) {
        this.removeWinnerFromList(winnerName);
        this.restoreSettingsPanel();
        return;
      }

      if (options.showWinnerModal) {
        this.openWinnerModal(winnerName);
        return;
      }

      this.restoreSettingsPanel();
    }, 1200);
  }

  private handleWinnerAction(action: 'remove' | 'keep' | 'continue'): void {
    if (action === 'remove') {
      this.removeWinnerFromList(this.lastWinnerName);
    }

    this.closeWinnerModal();
    this.restoreSettingsPanel();
  }

  private removeWinnerFromList(winnerName: string): void {
    if (!winnerName) {
      return;
    }

    const result = removeWinnerFromInput(this.elements.namesInput.value, winnerName);
    if (!result.removed) {
      return;
    }

    this.elements.namesInput.value = result.value;
    this.refreshParticipants();
    this.showToast(`${winnerName} removed for the next round`);
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('hide');
      window.setTimeout(() => toast.remove(), 250);
    }, 2200);
  }

  private minimizeSettingsPanel(): void {
    this.elements.settingsPanel.classList.add('minimized');
    this.updateSettingsHeaderState();
  }

  private restoreSettingsPanel(): void {
    this.elements.settingsPanel.classList.remove('hide');
    this.elements.settingsPanel.classList.remove('minimized');
    this.updateSettingsHeaderState();
  }

  private updateSettingsHeaderState(): void {
    const isExpanded = !this.elements.settingsPanel.classList.contains('minimized');
    this.elements.settingsHeader.setAttribute('aria-expanded', String(isExpanded));
  }

  private openAdvancedSettings(): void {
    this.captureFocus();
    this.applySettingsToControls();
    setHidden(this.elements.advancedBackdrop, false);
    setHidden(this.elements.advancedModal, false);
    this.elements.closeAdvancedButton.focus();
  }

  private closeAdvancedSettings(): void {
    this.applySettingsToControls();
    this.applySettingsToRuntime();
    setHidden(this.elements.advancedBackdrop, true);
    setHidden(this.elements.advancedModal, true);
    this.restoreFocus();
  }

  private openWinnerModal(winnerName: string): void {
    this.captureFocus();
    this.elements.winnerName.textContent = winnerName;
    setHidden(this.elements.winnerModal, false, 'flex');
    this.elements.removeWinnerButton.focus();
  }

  private closeWinnerModal(): void {
    setHidden(this.elements.winnerModal, true, 'flex');
    this.restoreFocus();
  }

  private openNotice(): void {
    this.captureFocus();
    setHidden(this.elements.notice, false, 'flex');
    this.elements.closeNotice.focus();
  }

  private closeNotice(): void {
    setHidden(this.elements.notice, true, 'flex');
    safeLocalStorageSet(NOTICE_STORAGE_KEY, String(CURRENT_NOTICE));
    this.restoreFocus();
  }

  private updateNoticeVisibility(): void {
    const lastViewed = safeLocalStorageGet(NOTICE_STORAGE_KEY);
    if (lastViewed === null || Number(lastViewed) < CURRENT_NOTICE) {
      this.openNotice();
      return;
    }

    setHidden(this.elements.notice, true, 'flex');
  }

  private trackEvent(name: string, value: number): void {
    if (window.gtag) {
      window.gtag('event', name, {
        event_category: 'roulette',
        event_label: name,
        value,
      });
    }
  }

  private animateButton(button: HTMLButtonElement): void {
    if (!options.enableAnimations || !window.animations) {
      return;
    }

    window.animations.buttonClick(button);
  }

  private captureFocus(): void {
    this.lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  private restoreFocus(): void {
    this.lastFocusedElement?.focus();
    this.lastFocusedElement = null;
  }
}

function getAppElements(): AppElements {
  return {
    settingsPanel: requireElement<HTMLElement>('#settings'),
    settingsHeader: requireElement<HTMLElement>('.settings-header'),
    namesInput: requireElement<HTMLTextAreaElement>('#in_names'),
    participantSummary: requireElement<HTMLElement>('#participantSummary'),
    participantValidation: requireElement<HTMLElement>('#participantValidation'),
    statusIndicator: requireElement<HTMLElement>('.status-indicator'),
    btnNotice: requireElement<HTMLButtonElement>('#btnNotice'),
    btnShuffle: requireElement<HTMLButtonElement>('#btnShuffle'),
    btnStart: requireElement<HTMLButtonElement>('#btnStart'),
    mapSelector: requireElement<HTMLSelectElement>('#sltMap'),
    autoRecordingToggle: requireElement<HTMLInputElement>('#chkAutoRecording'),
    skillToggle: requireElement<HTMLInputElement>('#chkSkill'),
    firstWinnerButton: requireElement<HTMLButtonElement>('.btn-first-winner'),
    lastWinnerButton: requireElement<HTMLButtonElement>('.btn-last-winner'),
    rankInput: requireElement<HTMLInputElement>('#in_winningRank'),
    rankHelp: requireElement<HTMLElement>('#winnerRankHelp'),
    advancedButton: requireElement<HTMLButtonElement>('#btnAdvancedSettings'),
    advancedModal: requireElement<HTMLElement>('#advancedSettings'),
    advancedBackdrop: requireElement<HTMLElement>('#advancedBackdrop'),
    closeAdvancedButton: requireElement<HTMLButtonElement>('#btnCloseAdvanced'),
    resetSettingsButton: requireElement<HTMLButtonElement>('#btnResetSettings'),
    performanceMode: requireElement<HTMLSelectElement>('#performanceMode'),
    particleCount: requireElement<HTMLSelectElement>('#particleCount'),
    showFpsToggle: requireElement<HTMLInputElement>('#chkShowFPS'),
    advancedStatsToggle: requireElement<HTMLInputElement>('#chkAdvancedStats'),
    animationsToggle: requireElement<HTMLInputElement>('#chkAnimations'),
    soundEffectsToggle: requireElement<HTMLInputElement>('#chkSoundEffects'),
    hapticFeedbackToggle: requireElement<HTMLInputElement>('#chkHapticFeedback'),
    glowIntensity: requireElement<HTMLInputElement>('#glowIntensity'),
    transparency: requireElement<HTMLInputElement>('#transparency'),
    cameraSmoothing: requireElement<HTMLInputElement>('#cameraSmoothing'),
    zoomSensitivity: requireElement<HTMLInputElement>('#zoomSensitivity'),
    autoSaveToggle: requireElement<HTMLInputElement>('#chkAutoSave'),
    showWinnerModalToggle: requireElement<HTMLInputElement>('#chkShowWinnerModal'),
    autoRemoveWinnerToggle: requireElement<HTMLInputElement>('#chkAutoRemoveWinner'),
    inGameControls: requireElement<HTMLElement>('#inGame'),
    shakeButton: requireElement<HTMLButtonElement>('#btnShake'),
    notice: requireElement<HTMLElement>('#notice'),
    closeNotice: requireElement<HTMLButtonElement>('#closeNotice'),
    winnerModal: requireElement<HTMLElement>('#winnerModal'),
    winnerName: requireElement<HTMLElement>('#winnerName'),
    removeWinnerButton: requireElement<HTMLButtonElement>('#btnRemoveWinner'),
    keepWinnerButton: requireElement<HTMLButtonElement>('#btnKeepWinner'),
    continueButton: requireElement<HTMLButtonElement>('#btnContinue'),
    root: requireElement<HTMLElement>(':root'),
  };
}

export async function initAppUI(
  roulette: Roulette,
  performanceMonitor: PerformanceMonitor,
): Promise<void> {
  try {
    const controller = new RouletteUIController(
      roulette,
      performanceMonitor,
      getAppElements(),
    );
    await controller.init();
  } catch (error) {
    console.error('Failed to initialize app UI:', error);
  }
}
