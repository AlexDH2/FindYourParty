const GRACE_DAYS = 2
const FINALIZED_DAYS = 30
const ARCHIVED_DAYS = 30
const MS_PER_DAY = 1000 * 60 * 60 * 24

function parseEventDate(eventDateValue) {
  if (typeof eventDateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(eventDateValue)) {
    const [year, month, day] = eventDateValue.split("-").map(Number)
    return new Date(year, month - 1, day, 23, 59, 59, 999)
  }

  return new Date(eventDateValue)
}

function getDaysUntil(targetDate, referenceDate = new Date()) {
  return Math.max(0, Math.ceil((targetDate - referenceDate) / MS_PER_DAY))
}

export function getEventLifecycleInfo(eventDateValue, referenceDate = new Date()) {
  const eventDate = parseEventDate(eventDateValue)
  const activeUntil = new Date(eventDate)
  activeUntil.setHours(23, 59, 59, 999)

  const graceUntil = new Date(activeUntil)
  graceUntil.setDate(graceUntil.getDate() + GRACE_DAYS)

  const finalizedUntil = new Date(graceUntil)
  finalizedUntil.setDate(finalizedUntil.getDate() + FINALIZED_DAYS)

  const archivedUntil = new Date(finalizedUntil)
  archivedUntil.setDate(archivedUntil.getDate() + ARCHIVED_DAYS)

  if (referenceDate <= activeUntil) {
    return {
      lifecycleStatus: "active",
      nextLifecycleStatus: "grace",
      nextLifecycleDate: graceUntil,
    }
  }

  if (referenceDate <= graceUntil) {
    return {
      lifecycleStatus: "grace",
      nextLifecycleStatus: "finalized",
      nextLifecycleDate: finalizedUntil,
    }
  }

  if (referenceDate <= finalizedUntil) {
    return {
      lifecycleStatus: "finalized",
      nextLifecycleStatus: "archived",
      nextLifecycleDate: archivedUntil,
    }
  }

  if (referenceDate <= archivedUntil) {
    return {
      lifecycleStatus: "archived",
      nextLifecycleStatus: "deleted",
      nextLifecycleDate: null,
    }
  }

  return {
    lifecycleStatus: "deleted",
    nextLifecycleStatus: null,
    nextLifecycleDate: null,
  }
}

export function enrichEventWithLifecycle(event) {
  const lifecycleInfo = getEventLifecycleInfo(event?.date)

  return {
    ...event,
    ...lifecycleInfo,
    daysUntilNextLifecycleChange: lifecycleInfo.nextLifecycleDate
      ? getDaysUntil(lifecycleInfo.nextLifecycleDate)
      : 0,
  }
}

