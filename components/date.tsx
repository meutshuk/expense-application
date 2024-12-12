import React from 'react'
import { format } from 'date-fns';

export default function Date({ date }: { date: Date }) {
    console.log(date)
    return (
        <>{date.toLocaleDateString('en-GB')}</>
    );
}
