/**
 * DateTime Picker Component
 * Handles date and time input selection
 */

export class DateTimePicker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.dateInput = null;
        this.timeInput = null;
        this.render();
        this.initialize();
    }

    render() {
        this.container.innerHTML = `
            <div class="datetime-inputs">
                <div class="datetime-group">
                    <label for="dateInput">Date:</label>
                    <input type="date" id="dateInput">
                </div>
                <div class="datetime-group">
                    <label for="timeInput">Time:</label>
                    <input type="time" id="timeInput">
                </div>
            </div>
        `;

        this.dateInput = document.getElementById('dateInput');
        this.timeInput = document.getElementById('timeInput');
    }

    initialize() {
        const now = new Date();

        // Format date as YYYY-MM-DD
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        this.dateInput.value = `${year}-${month}-${day}`;

        // Format time as HH:MM
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        this.timeInput.value = `${hour}:${minute}`;
    }

    getDateTime() {
        return {
            date: this.dateInput.value,
            time: this.timeInput.value
        };
    }
}

