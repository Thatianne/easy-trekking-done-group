import * as dotenv from 'dotenv';
dotenv.config();

import { In } from "typeorm";
import { AppDataSource } from './database/configuration/db-data-source';
import { Trekking } from './entities/trekking';
import { Group } from "./entities/group";
import { TouristUserGroup } from "./entities/tourist-user-group";
import { GroupStatus } from "./entities/group-status";
import { GroupStatusEnum } from "./enums/group-status.enum"

const shouldDoneGroup = (group: Group, today: Date): boolean => {
  const doneDate = new Date(group.date);
  doneDate.setDate(group.date.getDate() + 1);

  doneDate.setHours(0, 0, 0, 0);

  return today >= doneDate;
}

const myHandler = async () => {
  const groupRepository = AppDataSource.getRepository(Group);
  const touristUserGroupRepository = AppDataSource.getRepository(TouristUserGroup);

  const groups = await groupRepository.find({
      where: {
        groupStatus: {
          id: In([GroupStatusEnum.Confirmed])
        }
      },
      relations: {
        groupStatus: true,
        trekking: true
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupsToBeDone = groups.filter((group) => shouldDoneGroup(group, today));

    const doneStatus = new GroupStatus();
    doneStatus.id = GroupStatusEnum.Done
    groupsToBeDone.forEach((group) => group.groupStatus = doneStatus);

    await groupRepository.save(groupsToBeDone);
}

// Database connection
AppDataSource.initialize()
  .then(() => {
    myHandler(); // test locally
  })

module.exports.handler = myHandler