import {
  Button,
  Checkbox,
  FormHelperText,
  FormGroup,
  Form,
  TextInput,
  HelperText,
  HelperTextItem,
  Radio,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import React from 'react';
import { ActionOperations, ActionTypes } from '@app/types/types';
import DateTimePicker from './DateTimePicker';
import { AccountTypeaheadSelect } from './AccountSelector';
import { ClusterTypeaheadSelect } from './ClusterSelector';
import { ActionStatus } from '@app/types/types';
import { useUser } from '@app/Contexts/UserContext.tsx';
import { debug } from '@app/utils/debugLogs';
import { api, startCluster, stopCluster, AccountResponseApi, ClusterResponseApi, ActionRequestApi } from '@api';
import { fetchAllPages } from '@app/utils/fetchAllPages';
import cronValidate from 'cron-validate';

interface ModalPowerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const ModalPowerManagement: React.FunctionComponent<ModalPowerManagementProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { userEmail } = useUser();

  // Modal From parameters
  const [selectedAccount, setSelectedAccount] = React.useState<AccountResponseApi | null>(null);
  const [selectedCluster, setSelectedCluster] = React.useState<ClusterResponseApi | null>(null);
  const [actionOperation, setActionOperation] = React.useState('');
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [cronExpression, setCronExpression] = React.useState('');
  const [cronTouched, setCronTouched] = React.useState(false);
  const [description, setDescription] = React.useState<string>('');
  const [showDescriptionField, setShowDescriptionField] = React.useState(false);

  // Account/Cluster typeahead vars
  const [allAccounts, setAllAccounts] = React.useState<AccountResponseApi[]>([]);
  const [allClusters, setAllClusters] = React.useState<ClusterResponseApi[]>([]);

  // TODO: restore Loading spinner
  //const [loading, setLoading] = React.useState(true);

  // Action type selection
  const [actionType, setActionType] = React.useState<ActionTypes>(ActionTypes.INSTANT_ACTION);

  const isValidCronExpression = (expr: string): boolean => {
    if (!expr.trim()) return false;
    const result = cronValidate(expr, { preset: 'default' });
    return result.isValid();
  };

  const isCommonValid = !!selectedAccount && !!selectedCluster && actionOperation.trim() !== '';

  const isExecutionValid =
    actionType === ActionTypes.INSTANT_ACTION ||
    (actionType === ActionTypes.SCHEDULED_ACTION && scheduledDateTime !== '') ||
    (actionType === ActionTypes.CRON_ACTION && cronExpression !== '' && isValidCronExpression(cronExpression));

  const isFormValid = isCommonValid && isExecutionValid;

  // Typeahead clear button functions
  const onAccountClearButtonClick = () => {
    setSelectedAccount(null);
  };

  const onClusterClearButtonClick = () => {
    setSelectedCluster(null);
  };

  // Load accounts when the modal opens.
  React.useEffect(() => {
    if (!isOpen) return;

    const fetchAccounts = async () => {
      //setLoading(true);
      try {
        const accountFullList = await fetchAllPages(async (page, pageSize) => {
          const { data } = await api.accounts.accountsList({ page, page_size: pageSize });
          return { items: data.items || [], count: data.count || 0 };
        });
        setAllAccounts(accountFullList);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setAllAccounts([]);
      } finally {
        //setLoading(false);
      }
    };

    fetchAccounts();
  }, [isOpen]);

  // Reload clusters every time the selected account changes.
  React.useEffect(() => {
    if (!isOpen) return;

    // Reset dependent state when account changes / clears
    setSelectedCluster(null);
    setAllClusters([]);

    const accountId = selectedAccount?.accountId;
    if (!accountId) return;

    const fetchClusters = async () => {
      //setLoading(true);
      try {
        const clusterFullList = await fetchAllPages(async (page, pageSize) => {
          const { data } = await api.accounts.clustersList(accountId, { page, page_size: pageSize });
          return { items: data.items || [], count: data.count || 0 };
        });
        setAllClusters(clusterFullList);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        setAllClusters([]);
      } finally {
        //setLoading(false);
      }
    };

    fetchClusters();
  }, [isOpen, selectedAccount?.accountId]);

  // Reset modal state when closing to avoid leaking previous selections.
  React.useEffect(() => {
    if (isOpen) return;

    setShowDescriptionField(false);
    setDescription('');
    setShowSchedule(false);
    setActionType(ActionTypes.INSTANT_ACTION);
    setScheduledDateTime('');
    setCronExpression('');
    setCronTouched(false);
    setSelectedAccount(null);
    setSelectedCluster(null);
    setAllClusters([]);
  }, [isOpen]);

  const handlerConfirmActionCreation = async () => {
    // Ensure clusterID is not undefined before performing any action
    if (!selectedCluster?.clusterId) {
      console.error('ClusterID is undefined. Cannot perform scheduled action');
      return;
    }

    const finalDescription = showDescriptionField ? description : 'Routine maintenance';

    // Instant Action run
    if (actionType === ActionTypes.INSTANT_ACTION) {
      if (actionOperation === ActionOperations.POWER_ON) {
        debug('Powering on the cluster');
        startCluster(selectedCluster?.clusterId, userEmail ?? undefined, finalDescription);
      } else if (actionOperation === ActionOperations.POWER_OFF) {
        debug('Powering off the cluster');
        stopCluster(selectedCluster?.clusterId, userEmail ?? undefined, finalDescription);
      }
    } else {
      // Creating base action. Tunning depending on ActionType
      const powerActionRequest = {
        accountId: selectedAccount?.accountId,
        clusterId: selectedCluster?.clusterId,
        enabled: true,
        operation: actionOperation,
        region: selectedCluster?.region,
        status: ActionStatus.Pending,
        description: finalDescription,
      } as ActionRequestApi;

      // Scheduled Action run
      if (actionType === ActionTypes.SCHEDULED_ACTION) {
        // TODO: Convert to data validation
        if (!scheduledDateTime) {
          console.error('Scheduled DateTime is required');
          return;
        }
        powerActionRequest.type = ActionTypes.SCHEDULED_ACTION;
        powerActionRequest.time = scheduledDateTime;
        // Cron Action run
      } else if (actionType === ActionTypes.CRON_ACTION) {
        // TODO: Convert to data validation
        if (!cronExpression.trim()) {
          console.error('Cron expression is empty');
          return;
        }

        powerActionRequest.type = ActionTypes.CRON_ACTION;
        powerActionRequest.cronExpression = cronExpression.trim();
      }

      const powerActionRequests: ActionRequestApi[] = [powerActionRequest];
      console.log(powerActionRequest);
      await api.actions.actionsCreate(powerActionRequests);
      onCreated();
      onClose();
    }

    onClose();
  };

  // Do not render anything if there is no action
  if (!isOpen || !actionType) {
    return null;
  }

  // Scheduling modal for Schedule action
  return (
    <Modal
      variant={ModalVariant.small}
      title="Power management"
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button key="confirm" variant="primary" onClick={handlerConfirmActionCreation} isDisabled={!isFormValid}>
          Confirm
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
      appendTo={document.body}
    >
      {/* Account selection */}

      <Form>
        <AccountTypeaheadSelect
          accounts={allAccounts}
          selectedAccount={selectedAccount}
          onSelectAccount={account => {
            setSelectedAccount(account);
          }}
          onClearAccount={onAccountClearButtonClick}
        />
        <ClusterTypeaheadSelect
          accountId={selectedAccount?.accountId ?? null}
          clusters={allClusters}
          selectedCluster={selectedCluster}
          onSelectCluster={cluster => {
            setSelectedCluster(cluster);
          }}
          isDisabled={!selectedAccount}
          onClearCluster={onClusterClearButtonClick}
        />

        {/* Action selection */}
        <FormGroup label="Action" role="radiogroup" isRequired fieldId="action-operation">
          <Radio
            id="action-power-on"
            name="action"
            label="Power On"
            isChecked={actionOperation === ActionOperations.POWER_ON}
            onChange={() => setActionOperation(ActionOperations.POWER_ON)}
          />
          <Radio
            id="action-power-off"
            name="action"
            label="Power Off"
            isChecked={actionOperation === ActionOperations.POWER_OFF}
            onChange={() => setActionOperation(ActionOperations.POWER_OFF)}
          />
        </FormGroup>

        {/* Schedule management */}
        <FormGroup label="Execution" fieldId="scheduled-action-type">
          <Checkbox
            id="scheduled-action-type"
            name="scheduled-action-type"
            label="Schedule action"
            isChecked={showSchedule}
            onChange={(_event, checked) => {
              setShowSchedule(checked);
              setActionType(checked ? ActionTypes.SCHEDULED_ACTION : ActionTypes.INSTANT_ACTION);
            }}
          />
        </FormGroup>
        {showSchedule && (
          <>
            <FormGroup role="radiogroup" fieldId="schedule-type">
              <Radio
                id="specific-time"
                name="scheduleType"
                label="Specific time"
                isChecked={actionType === ActionTypes.SCHEDULED_ACTION}
                onChange={() => setActionType(ActionTypes.SCHEDULED_ACTION)}
              />
            </FormGroup>
            {actionType === ActionTypes.SCHEDULED_ACTION && (
              <FormGroup fieldId="datetime-picker" isRequired>
                <DateTimePicker onChange={setScheduledDateTime} />
              </FormGroup>
            )}
            <FormGroup fieldId="cron-expression-input" isRequired>
              <Radio
                id="cron-expression"
                name="scheduleType"
                label="Cron expression"
                isChecked={actionType === ActionTypes.CRON_ACTION}
                onChange={() => setActionType(ActionTypes.CRON_ACTION)}
              />
            </FormGroup>
            {actionType === ActionTypes.CRON_ACTION && (
              <FormGroup fieldId="cron-expression-input" isRequired>
                <TextInput
                  type="text"
                  id="cron-expression-input"
                  value={cronExpression}
                  onChange={(_event, value) => setCronExpression(value)}
                  onBlur={() => setCronTouched(true)}
                  validated={cronTouched && !isValidCronExpression(cronExpression) ? 'error' : 'default'}
                  placeholder="0 0 * * *"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem
                      variant={cronTouched && !isValidCronExpression(cronExpression) ? 'error' : 'default'}
                      icon={
                        cronTouched && !isValidCronExpression(cronExpression) ? <ExclamationCircleIcon /> : undefined
                      }
                    >
                      {cronTouched && !isValidCronExpression(cronExpression)
                        ? 'Invalid cron expression'
                        : "Format: minute hour day-of-month month day-of-week (e.g., '0 0 * * *' for daily at midnight)"}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            )}
          </>
        )}

        {/* Description management */}
        <FormGroup label="Description" fieldId="description-input">
          <TextInput
            type="text"
            id="description-input"
            value={description}
            onChange={(_event, value) => setDescription(value)}
            placeholder="Enter reason"
            aria-label="Reason for action"
          />
        </FormGroup>
      </Form>
    </Modal>
  );

  // Fallback: do not render if action does not match any known case
  return null;
};
