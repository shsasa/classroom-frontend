import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './EditBatchSchedule.css';

const EditBatchSchedule = ({ batch, onClose, onScheduleUpdated }) => {
  const [schedule, setSchedule] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Initialize schedule with existing data or empty schedule for all days
    const initialSchedule = daysOfWeek.map(day => {
      const existingSchedule = batch.schedule?.find(s => s.day === day);
      if (existingSchedule) {
        return {
          ...existingSchedule,
          isActive: true // Mark as active if it exists in the schedule
        };
      } else {
        return {
          day,
          startTime: '',
          endTime: '',
          room: '',
          isActive: false
        };
      }
    });
    setSchedule(initialSchedule);
  }, [batch]);

  const handleScheduleChange = (dayIndex, field, value) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        [field]: value
      };
      return newSchedule;
    });
  };

  const handleDayToggle = (dayIndex) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        isActive: !newSchedule[dayIndex].isActive,
        // Clear times and room if deactivating
        ...(newSchedule[dayIndex].isActive ? {
          startTime: '',
          endTime: '',
          room: ''
        } : {})
      };
      return newSchedule;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Build the final schedule array
      const finalSchedule = [];

      schedule.forEach(daySchedule => {
        // Only include days that are active and have valid times
        if (daySchedule.isActive && daySchedule.startTime && daySchedule.endTime) {
          // Validate time format and logic
          if (daySchedule.startTime >= daySchedule.endTime) {
            throw new Error(`Invalid time range for ${daySchedule.day}: Start time must be before end time`);
          }

          // Add to final schedule
          finalSchedule.push({
            day: daySchedule.day,
            startTime: daySchedule.startTime,
            endTime: daySchedule.endTime,
            room: daySchedule.room || ''
          });
        }
      });

      // Send the complete schedule (this will replace the existing schedule entirely)
      await api.put(`/batches/${batch._id}`, {
        schedule: finalSchedule
      });

      toast.success('Schedule updated successfully');
      onScheduleUpdated && onScheduleUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      if (error.message && error.message.includes('Invalid time range')) {
        toast.error(error.message);
      } else {
        const errorMessage = error.response?.data?.msg || error.response?.data?.message || 'Failed to update schedule';
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="edit-schedule-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Batch Schedule</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="schedule-form">
            <div className="schedule-header">
              <h4>Weekly Schedule for {batch.name}</h4>
              <p className="schedule-note">Select active days and set time ranges for each day</p>
            </div>

            <div className="schedule-days">
              {schedule.map((daySchedule, index) => (
                <div key={daySchedule.day} className="day-schedule">
                  <div className="day-header">
                    <div className="day-toggle">
                      <input
                        type="checkbox"
                        id={`day-${index}`}
                        checked={daySchedule.isActive || false}
                        onChange={() => handleDayToggle(index)}
                      />
                      <label htmlFor={`day-${index}`} className="day-name">
                        {daySchedule.day}
                      </label>
                    </div>
                  </div>

                  {(daySchedule.isActive || daySchedule.startTime) && (
                    <div className="day-details">
                      <div className="time-inputs">
                        <div className="input-group">
                          <label>Start Time</label>
                          <select
                            value={daySchedule.startTime || ''}
                            onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                            className="time-select"
                          >
                            <option value="">Select start time</option>
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>

                        <div className="input-group">
                          <label>End Time</label>
                          <select
                            value={daySchedule.endTime || ''}
                            onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                            className="time-select"
                          >
                            <option value="">Select end time</option>
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Room (Optional)</label>
                        <input
                          type="text"
                          value={daySchedule.room || ''}
                          onChange={(e) => handleScheduleChange(index, 'room', e.target.value)}
                          placeholder="Enter room number or location"
                          className="room-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Updating...
              </>
            ) : (
              'Update Schedule'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBatchSchedule;
