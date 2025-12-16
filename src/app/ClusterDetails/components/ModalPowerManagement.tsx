import {
  Button,
  Checkbox,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Radio,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';
import DateTimePicker from './DateTimePicker';
import { CronAction, ScheduledAction, PowerAction } from './types';
import { useParams } from 'react-router-dom';
import { useUser } from '@app/Contexts/UserContext.tsx';
import { startCluster, stopCluster } from '@api';
import { debug } from '@app/utils/debugLogs';

type PowerManagementData = ScheduledAction | CronAction;

interface ModalPowerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  action: PowerAction | null;
}

export const ModalPowerManagement: React.FunctionComponent<ModalPowerManagementProps> = ({
  isOpen,
  onClose,
  action,
}) => {
  const { clusterID } = useParams();
  const { userEmail } = useUser();
  const [showDescriptionField, setShowDescriptionField] = React.useState(false);
  const [description, setDescription] = React.useState<string>('');
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [scheduleType, setScheduleType] = React.useState<'scheduled_action' | 'cron_action'>('scheduled_action');
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');
  const [cronExpression, setCronExpression] = React.useState('');

  // Reset local state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowDescriptionField(false);
      setDescription('');
      setShowSchedule(false);
      setScheduleType('scheduled_action');
      setScheduledDateTime('');
      setCronExpression('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    // Immediate action
    const finalDescription = showDescriptionField ? description : 'Routine maintenance';

    if (!showSchedule) {
      if (action === PowerAction.POWER_ON) {
        startCluster(clusterID, userEmail, finalDescription);
        debug('Powering on the cluster');
      } else if (action === PowerAction.POWER_OFF) {
        debug('Powering off the cluster');
        stopCluster(clusterID, userEmail, finalDescription);
      }
    } else {
      // Scheduled or Cron Action
      let powerActionRequest: PowerManagementData;
      if (scheduleType === 'scheduled_action') {
        if (!scheduledDateTime) {
          console.error('Scheduled DateTime is required');
        }
        powerActionRequest = {
          type: 'scheduled_action',
          time: scheduledDateTime,
          operation: action === PowerAction.POWER_ON ? 'PowerOnCluster' : 'PowerOffCluster',
          target: { clusterID },
          enabled: true,
          status: 'Pending',
        };
      } else {
        if (!cronExpression.trim()) {
          console.error('Cron expression is empty');
          return;
        }

        powerActionRequest = {
          type: 'cron_action',
          cronExp: cronExpression.trim(),
          operation: action === PowerAction.POWER_ON ? 'PowerOnCluster' : 'PowerOffCluster',
          target: { clusterID },
          enabled: true,
          status: 'Pending',
        };
      }
      // The backend expects an array
      const requestPayload = [powerActionRequest];

      try {
        // TODO: Scheduled action creation not available in generated API yet
        // await createScheduledAction(requestPayload);
        console.warn('Scheduled action creation not implemented yet');
        debug('Scheduled action created:', requestPayload);
      } catch (error) {
        console.error('Failed to schedule action:', error);
      }
    }
    onClose();
  };

  return (
    <div>
      <Modal
        variant={ModalVariant.small}
        title="Confirmation"
        isOpen={isOpen}
        onClose={onClose}
        actions={[
          <Button key="confirm" variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={onClose}>
            Cancel
          </Button>,
        ]}
        appendTo={document.body}
      >
        <Stack hasGutter>
          <StackItem>Are you sure you want to {action?.toLowerCase()} the cluster?</StackItem>
          {/* Reason management */}
          <StackItem>
            <Checkbox
              label="Specify reason"
              isChecked={showDescriptionField}
              onChange={(_event, checked) => setShowDescriptionField(checked)}
              id="specify-reason"
            />
          </StackItem>
          {showDescriptionField && (
            <StackItem>
              <TextInput
                type="text"
                id="description-input"
                value={description}
                onChange={(_event, value) => setDescription(value)}
                placeholder="Enter reason"
                aria-label="Reason for action"
              />
            </StackItem>
          )}
          {/* Schedule management */}
          <StackItem>
            <Checkbox
              label="Schedule"
              isChecked={showSchedule}
              onChange={(_event, checked) => setShowSchedule(checked)}
              id="specify-schedule"
            />
          </StackItem>
          {showSchedule && (
            <>
              <StackItem>
                <Radio
                  id="specific-time"
                  name="scheduleType"
                  label="Specific time"
                  isChecked={scheduleType === 'scheduled_action'}
                  onChange={() => setScheduleType('scheduled_action')}
                />
              </StackItem>
              {scheduleType === 'scheduled_action' && (
                <StackItem>
                  <DateTimePicker onChange={setScheduledDateTime} />
                </StackItem>
              )}
              <StackItem>
                <Radio
                  id="cron-expression"
                  name="scheduleType"
                  label="Cron expression"
                  isChecked={scheduleType === 'cron_action'}
                  onChange={() => setScheduleType('cron_action')}
                />
              </StackItem>
              {scheduleType === 'cron_action' && (
                <StackItem>
                  <TextInput
                    type="text"
                    id="cron-expression-input"
                    value={cronExpression}
                    onChange={(_event, value) => setCronExpression(value)}
                    placeholder="0 0 * * *"
                  />
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Format: minute hour day-of-month month day-of-week (e.g., &apos;0 0 * * *&apos; for daily at
                        midnight)
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </StackItem>
              )}
            </>
          )}
        </Stack>
      </Modal>
    </div>
  );
};
