import React from 'react';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import { Button } from '../../ui/buttons.js';
import { TextInput, InputLabel, FormSection } from '../../ui/inputs.js';
import { useApi, API_STATE, useObjectState } from '../../hooks/index.js';

type Props = {
  section: Lhd.Section;
};

const formatHours = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const timezoneOffset = new Date().getTimezoneOffset();

const timezoneOffsetFormatted = `${timezoneOffset < 0 ? '+' : '-'}${Math.floor(
  Math.abs(timezoneOffset) / 60
)
  .toString()
  .padStart(2, '0')}:${(Math.abs(timezoneOffset) % 60)
  .toString()
  .padStart(2, '0')}`;

const hoursArray = Array.from(Array(24).keys());

const weekDayLabel = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type SectionSettings = {
  name: string;
  weekSchedule: number[];
};

const SectionSettings: React.FC<Props> = ({ section }) => {
  const updateSection = useApi(`/api/admin/section/${section._id}`, {
    method: 'PUT',
    delay: 300,
  });
  const [form, setForm] = useObjectState<SectionSettings>({
    name: section.name,
    weekSchedule: [...section.weekSchedule],
  });

  return (
    <>
      <FormSection marginBottom="20px">
        <InputLabel>Section name</InputLabel>
        <TextInput
          type="text"
          placeholder="Enter a name for the section"
          onChange={(e) => setForm({ name: e.target.value })}
          value={form.name}
          disabled={updateSection.state === API_STATE.FETCHING}
        />
      </FormSection>
      <FormSection marginBottom="20px">
        <InputLabel>Scheduled runs</InputLabel>
        <WeekWrapper>
          {form.weekSchedule.map((weekDay, i) => (
            <WeekDay key={i}>
              <WeekDayLabel>{weekDayLabel[i]}</WeekDayLabel>
              <HourSelect
                key={i}
                value={weekDay}
                onChange={(event) => {
                  const weekSchedule = [...form.weekSchedule];
                  weekSchedule[i] = parseInt(event.currentTarget.value);
                  setForm({ weekSchedule });
                }}
              >
                <option value={-1}>None</option>
                {hoursArray.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHours(hour)}
                  </option>
                ))}
              </HourSelect>
            </WeekDay>
          ))}
        </WeekWrapper>
        <Info>
          The times above shows UTC times. Your timezone seems to be{' '}
          {timezoneOffsetFormatted}.
        </Info>
      </FormSection>
      <ButtonWrapper>
        <Button
          size="large"
          disabled={
            (form.name === section.name &&
              isEqual(form.weekSchedule, section.weekSchedule)) ||
            updateSection.state === API_STATE.FETCHING
          }
          onClick={() => updateSection.exec({ payload: form })}
        >
          Save
        </Button>
        <Button
          size="large"
          disabled={
            (form.name === section.name &&
              isEqual(form.weekSchedule, section.weekSchedule)) ||
            updateSection.state === API_STATE.FETCHING
          }
          onClick={() =>
            setForm({
              name: section.name,
              weekSchedule: [...section.weekSchedule],
            })
          }
        >
          Reset
        </Button>
      </ButtonWrapper>
    </>
  );
};

export default SectionSettings;

const WeekWrapper = styled.div`
  display: flex;
  margin: 0px -${({ theme }) => theme.gridGap / 2}px;
  justify-content: stretch;
  width: calc(100% + ${({ theme }) => theme.gridGap}px);
`;

const WeekDay = styled.div`
  display: flex;
  padding: 0px ${({ theme }) => theme.gridGap / 2}px;
  justify-content: stretch;
  width: 100%;
  flex-direction: column;
`;

const WeekDayLabel = styled.div`
  margin-bottom: ${({ theme }) => theme.gridGap}px;
  font-size: 13px;
`;

const HourSelect = styled.select`
  display: block;
  flex: 1 0 auto;
  padding: 5px 2px;
  border: 0;
  border-radius: 2px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  > button {
    margin-right: ${({ theme }) => theme.gridGap}px;
  }
`;

const Info = styled.p`
  margin-top: 20px;
  font-size: 13px;
`;
