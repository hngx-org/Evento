interface NotificationPreference {
    newsletter: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_registration: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_invite: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    join_event: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_change: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
}

interface Preference {
    inApp: boolean;
    email: boolean;
    push: boolean;
}

export {NotificationPreference, Preference}