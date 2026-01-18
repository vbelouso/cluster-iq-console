import { renderActionTypeLabel, renderOperationLabel, renderActionStatusLabel } from '@app/utils/renderUtils';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Label } from '@patternfly/react-core';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActionStatus, ActionOperations, ActionTypes } from '@app/types/types';
import { Link } from 'react-router-dom';
import { api, ActionResponseApi } from '@api';
import { LoadingSpinner } from '@app/components/common/LoadingSpinner';
import { TablePagination } from '@app/components/common/TablesPagination';
import { paginateItems } from '@app/utils/tableFilters';
import { ActionsColumn } from '@patternfly/react-table';
import { rowActions } from './ActionsKebabMenu';

export const ScheduleActionsTable: React.FunctionComponent<{
  actionType: ActionTypes | null;
  actionOperation: ActionOperations[] | null;
  actionStatus: ActionStatus | null;
  actionEnabled: boolean | null;
  accountId: string | null;
  reloadFlag: number;
}> = ({ actionType, actionOperation, actionStatus, actionEnabled, accountId, reloadFlag }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [allActions, setAllActions] = useState<ActionResponseApi[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionResponseApi[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const reloadActions = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      const { data } = await api.schedule.scheduleList(
        { page: 1, page_size: 10000 },
        { signal: controllerRef.current.signal }
      );
      if (!controllerRef.current.signal.aborted) {
        setAllActions(data.items || []);
      }
    } catch (error) {
      if (!controllerRef.current?.signal.aborted) {
        console.error('Error fetching ScheduleActions:', error);
      }
    } finally {
      if (!controllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    reloadActions();
    return () => controllerRef.current?.abort();
  }, [reloadFlag, reloadActions]);

  // Apply filters when data or filter props change
  useEffect(() => {
    let filtered = allActions;

    if (actionType) {
      filtered = filtered.filter(item => item.type === actionType);
    }

    if (accountId) {
      filtered = filtered.filter(item => item.accountId?.includes(accountId));
    }

    if (actionOperation?.length) {
      filtered = filtered.filter(item => {
        return actionOperation.includes(item.operation as never);
      });
    }

    if (actionStatus) {
      filtered = filtered.filter(item => item.status === actionStatus);
    }

    if (actionEnabled !== null) {
      filtered = filtered.filter(item => item.enabled === actionEnabled);
    }

    setFilteredCount(filtered.length);
    setFilteredActions(paginateItems(filtered, page, perPage));
  }, [allActions, actionType, accountId, actionOperation, actionStatus, actionEnabled, page, perPage]);

  const columnNames = {
    id: 'ID',
    type: 'Action Type',
    time: 'Time',
    cronExpression: 'Cron Expression',
    operation: 'Operation',
    status: 'Status',
    clusterId: 'Cluster ID',
    accountId: 'Account ID',
    region: 'Region',
    enabled: 'Enabled',
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table aria-label="ScheduleActions table">
          <Thead>
            <Tr>
              <Th>{columnNames.id}</Th>
              <Th>{columnNames.type}</Th>
              <Th>{columnNames.time}</Th>
              <Th>{columnNames.cronExpression}</Th>
              <Th>{columnNames.operation}</Th>
              <Th>{columnNames.status}</Th>
              <Th>{columnNames.clusterId}</Th>
              <Th>{columnNames.region}</Th>
              <Th>{columnNames.accountId}</Th>
              <Th>{columnNames.enabled}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredActions.map(action => (
              <Tr key={action.id}>
                <Td dataLabel={columnNames.id}>{action.id}</Td>
                <Td dataLabel={columnNames.type}>{renderActionTypeLabel(action.type)}</Td>
                <Td dataLabel={columnNames.time}>{action.type !== ActionTypes.CRON_ACTION ? action.time : '-'}</Td>
                <Td dataLabel={columnNames.cronExpression}>
                  {action.type === ActionTypes.CRON_ACTION ? action.cronExpression : '-'}
                </Td>
                <Td dataLabel={columnNames.operation}>{renderOperationLabel(action.operation)}</Td>
                <Td dataLabel={columnNames.status}>{renderActionStatusLabel(action.status)}</Td>
                <Td dataLabel={columnNames.clusterId}>
                  <Link to={`/clusters/${action.clusterId}`}>{action.clusterId}</Link>
                </Td>
                <Td dataLabel={columnNames.region}>{action.region}</Td>
                <Td dataLabel={columnNames.accountId}>
                  <Link to={`/accounts/${action.accountId}`}>{action.accountId}</Link>
                </Td>
                <Td dataLabel={columnNames.enabled}>
                  {action.enabled ? <Label color="green">Enabled</Label> : <Label color="red">Disabled</Label>}
                </Td>
                {/* Kebab actions per row */}
                <Td isActionCell aria-label="Row actions">
                  <ActionsColumn items={rowActions(action, reloadActions)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <TablePagination
        itemCount={filteredCount}
        page={page}
        perPage={perPage}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
    </>
  );
};

export default ScheduleActionsTable;
