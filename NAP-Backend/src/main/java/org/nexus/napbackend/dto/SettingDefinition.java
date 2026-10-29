package org.nexus.napbackend.dto;

/**
 * Describes a single configurable site setting so the admin UI can render the
 * correct control without hardcoding the catalogue on the client.
 *
 * @param key          the persisted setting key (tenant scoped)
 * @param label        human readable label
 * @param group        grouping used to build tabs (university, chat, branding)
 * @param type         control type: text, textarea, boolean, json, color
 * @param defaultValue value shown when the tenant has not set the key
 * @param description  helper text for the admin
 * @param chatRelevant whether the AI assistant consumes this key
 */
public record SettingDefinition(
        String key,
        String label,
        String group,
        String type,
        String defaultValue,
        String description,
        boolean chatRelevant
) {}
