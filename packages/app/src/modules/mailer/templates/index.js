export default function () {
  return {
    change_place_time_group_meeting: require('./change_place_time_group_meeting').default,
    change_time_group_meeting: require('./change_time_group_meeting').default,
    change_place_group_meeting: require('./change_place_group_meeting').default,
    sign_in: require('./sign_in').default,
    group_meetings: require('./group_meetings').default,
    meeting_confirmited: require('./meeting_confirmited').default,
    meeting_rejected: require('./meeting_rejected').default,
    message: require('./message').default,
    recovery_password: require('./recovery_password').default,
    request_meeting_help_me: require('./request_meeting_help_me').default,
    request_meeting_help_you: require('./request_meeting_help_you').default,
    review: require('./review').default,
  };
}
