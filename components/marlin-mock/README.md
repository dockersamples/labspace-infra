# Marlin Mock

Marlin is an internal tool at Docker used for event tracking. This mock provides the ability to send events during development without the need for an API key, etc.

Only the most recent 100 events are stored in the system.

## Mock Marlin interface

Opening the Marlin app (defaults on port 3000) will provide a view of the 100 most recently submitted events.

## API endpoints

The main endpoint is used to track an event:

- `POST /events/v1/track` - store the provided event. The payload body must have the following structure:

    ```json
    {
        "records": [
            {
                "event": <string>,
                "properties": <map>,
                "event_timestamp": <int> (unix millis),
                "source": <string>
            }
        ]
    }
    ```

To support testing, the following endpoints are also available:

- `GET /events` - get the most recent events submitted
- `DELETE /events` - clear all events from the system
