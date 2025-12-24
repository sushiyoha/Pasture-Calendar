import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // 需要 npm install uuid @types/uuid
import { Task } from '../types';

// 获取或生成访客ID (存在浏览器缓存里)
const getGuestId = () => {
  let id = localStorage.getItem('calendar_guest_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('calendar_guest_id', id);
  }
  return id;
};

export const taskService = {
  // 1. 获取所有任务
  fetchAll: async () => {
    const guestId = getGuestId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('guest_id', guestId);

    if (error) throw error;
    
    // 转换 DB 数据结构 -> 前端 Task 结构
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      completed: item.is_completed,
      createdAt: new Date(item.created_at).getTime(),
      gridId: item.grid_id // 临时附带 gridId 以便前端归类
    }));
  },

  // 2. 添加任务
  add: async (title: string, gridId: string) => {
    const guestId = getGuestId();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        guest_id: guestId,
        grid_id: gridId,
        title: title,
        is_completed: false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      completed: data.is_completed,
      createdAt: new Date(data.created_at).getTime()
    } as Task;
  },

  // 3. 删除任务
  delete: async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  // 4. 切换状态
  toggle: async (taskId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: isCompleted })
      .eq('id', taskId);
    if (error) throw error;
  }
};