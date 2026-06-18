package com.jiyad.service;

import com.jiyad.model.AppSettings;
import com.jiyad.repository.AppSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reads/writes the single app-wide settings row (creates it on first access). */
@Service
@Transactional(readOnly = true)
public class SettingsService {

    private final AppSettingsRepository repository;

    public SettingsService(AppSettingsRepository repository) {
        this.repository = repository;
    }

    public AppSettings get() {
        return repository.findById(AppSettings.SINGLETON_ID).orElseGet(() -> {
            AppSettings s = new AppSettings();
            return repository.save(s);
        });
    }

    public boolean isUploadsFrozen() {
        return get().isUploadsFrozen();
    }

    @Transactional
    public AppSettings setUploadsFrozen(boolean frozen) {
        AppSettings s = get();
        s.setUploadsFrozen(frozen);
        return repository.save(s);
    }
}
