package com.jiyad.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Single-row, app-wide settings (always id = 1). Currently just the "freeze new uploads"
 * moderation flag: while on, newly-created PGs are held (frozen) and hidden from the public.
 */
@Entity
@Table(name = "app_settings")
public class AppSettings {

    public static final Long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    private boolean uploadsFrozen = false;

    public AppSettings() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isUploadsFrozen() {
        return uploadsFrozen;
    }

    public void setUploadsFrozen(boolean uploadsFrozen) {
        this.uploadsFrozen = uploadsFrozen;
    }
}
