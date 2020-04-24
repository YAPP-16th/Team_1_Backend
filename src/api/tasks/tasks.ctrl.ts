import { TaskDocument } from './../../models/task';
import { Context } from 'koa';
import Task from '../../models/task';
import User from '../../models/task';

export const isExisted = async (ctx: Context, next: () => void) => {

  const user = ctx.state.user;
  const { id } = ctx.params;

  const taskIdx = user.taskIds.findIndex(
    (task: TaskDocument) => task._id == id,
  );

  if (taskIdx === -1) {
    ctx.status = 404;
    ctx.body = {
      description: 'Not found task',
    };
    return;
  }

  ctx.state.id = id;
  ctx.state.taskIdx = taskIdx;

  return next();
};

/* Task 목록 리스트
GET /api/tasks
*/
export const list = async (ctx: Context) => {
  const user = ctx.state.user;
  const taskIds = user.taskIds;
  
  const result = [];
  try{
    for(let i = 0 ; i < taskIds.length ; i++){
      result.push(await Task.findById(taskIds[i]));
    }
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = {
    description: 'Succeed get task list',
    tasks: result
  };

}
/* 특정 Task 정보 읽기
GET /api/tasks/:id
*/
export const taskInfo = async (ctx : Context) => {

  const {user, taskIdx} = ctx.state;

  try{
    const result = await Task.findById({_id : user.taskIds[taskIdx]});

    ctx.status = 200;
    ctx.body = {
      description: 'Succeed get task info',
      task: result
    }
  } catch (e) {
    ctx.throw(500, e);
  }

}

/* 특정 Task 작성
POST /api/tasks
{ title, coordinates, tags, memo, iconURL, isFinished, dueDate}
*/
export const write = async (ctx : Context) => {
  const user = ctx.state.user;
  const task = new Task({ ...ctx.request.body});

  //task Document 추가
  try{
    await task.save();
  } catch (e) {
    ctx.throw(500, e);
  }

  //User Document에서 Task ObjectId 참조
  const taskObjectId = task._id;
  user.taskIds.push(taskObjectId);

  try{
    await user.save();
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.status = 200;
  ctx.body = {
    description : 'Succeed write Task',
    user : user
  }


}

/* 특정 Task 삭제
DELETE /api/tasks/:id
*/
export const secession = async (ctx : Context) => {
  //클라이언트에서 id를 어떻게 알아..?
  const {user, id} = ctx.state;

  user.taskIds.pull({_id : id})

  try{
    await user.save();
    ctx.status = 204;

  } catch (e) {
    ctx.throw(500, e);
  }
};

/* 특정 Task 업데이트
PATCH /api/tasks/:id
{ 수정할필드1, 수정할필드2, ... }
*/
export const updateTask = async (ctx : Context) => {

  const {id} = ctx.state;

  try{
    await Task.findByIdAndUpdate(id, ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.status = 204;
}


