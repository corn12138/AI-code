'use client';

import { useState } from 'react';
import { updateData } from '../actions/serverActions';

export default function FormWithServerAction() {
    const [status, setStatus] = useState('');

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setStatus('提交中...');

        const formData = new FormData(event.target as HTMLFormElement);
        const result = await updateData(formData);

        setStatus(result.success ? '提交成功!' : '提交失败');
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="输入标题" />
            <button type="submit">提交</button>
            {status && <p>{status}</p>}
        </form>
    );
}
