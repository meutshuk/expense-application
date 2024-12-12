import React from 'react'
import { format } from 'date-fns';

export default function Date({ date }: { date: Date }) {

    return (
        <>{date.toLocaleDateString('en-GB')}</>
    );
}
