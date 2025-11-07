import { Condition, GetStructType, QuestNodePrototype, Struct } from "s2cfgtojson";

export const getLaunchers = (sids_names: { SID: string; Name: string }[]) => {
  return new Struct(
    Object.fromEntries(
      sids_names.map(({ SID, Name }) => [
        `${SID}${Name}_Launcher`,
        {
          Excluding: false,
          Connections: { 0: { SID, Name } },
        },
      ]),
    ),
  ) as QuestNodePrototype["Launchers"];
};

export const getConditions = (conditions: Partial<Condition>[]) =>
  Object.assign(
    new Struct(
      Object.fromEntries(
        conditions.map((condition, i) => {
          return [i, new Struct({ 0: new Struct(condition) })];
        }),
      ),
    ) as GetStructType<QuestNodePrototype["Conditions"]>,
    { ConditionCheckType: "EConditionCheckType::And" },
  ).fork(true);
