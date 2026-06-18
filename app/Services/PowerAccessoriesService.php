<?php

namespace App\Services;

class PowerAccessoriesService
{
    /**
     * Filter out removed accessories and replace serial_label with current_sn when available.
     *
     * Rules:
     * - is_removed === true  → exclude the item entirely
     * - current_sn not empty → overwrite serial_label with current_sn
     */
    public static function filterForDisplay(?array $powerAccessories): ?array
    {
        if (empty($powerAccessories)) {
            return $powerAccessories;
        }

        foreach ($powerAccessories as $type => &$items) {
            if (!is_array($items)) {
                continue;
            }

            $items = array_values(array_filter($items, fn($acc) => !($acc['is_removed'] ?? false)));

            foreach ($items as &$acc) {
                if (!empty($acc['current_sn'])) {
                    $acc['serial_label'] = $acc['current_sn'];
                }
            }
            unset($acc);
        }
        unset($items);

        return $powerAccessories;
    }

    /**
     * Resolve the serial number to persist for an accessory row.
     * Uses current_sn when available; otherwise falls back to the main product serial.
     */
    public static function resolveSerial(array $acc, string $mainSerial): string
    {
        return !empty($acc['current_sn']) ? $acc['current_sn'] : $mainSerial;
    }

    /**
     * Return true if the accessory has been removed from the set and should be skipped.
     */
    public static function isRemoved(array $acc): bool
    {
        return (bool) ($acc['is_removed'] ?? false);
    }
}
