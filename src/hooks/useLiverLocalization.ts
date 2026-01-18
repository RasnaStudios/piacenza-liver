import { useTranslation } from "react-i18next"
import type { LiverGod, LiverGroup } from "../scene/LiverData"

export function useLocalizedGroup(group: LiverGroup) {
  const { t } = useTranslation("liverData")
  return Object.assign({}, group, {
    name: t(`groups.${group.id}.name`),
    description: t(`groups.${group.id}.description`),
  }) as LiverGroup & { name: string; description: string }
}

export function useLocalizedGod(god: LiverGod) {
  const { t } = useTranslation("liverData")
  return Object.assign({}, god, {
    description: t(`deities.${god.id}.description`),
  }) as LiverGod & { description: string }
}

export function useLocalizedGroups(groups: Record<string, LiverGroup>) {
  const { t } = useTranslation("liverData")
  const localized: Record<
    string,
    LiverGroup & { name: string; description: string }
  > = {}
  for (const [key, group] of Object.entries(groups)) {
    localized[key] = Object.assign({}, group, {
      name: t(`groups.${group.id}.name`),
      description: t(`groups.${group.id}.description`),
    }) as LiverGroup & { name: string; description: string }
  }
  return localized
}
