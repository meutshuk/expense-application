import { sendNotification } from '@/app/actions';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';


type UploadResponse =
    { success: true; result?: UploadApiResponse } |
    { success: false; error: UploadApiErrorResponse };


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (
    fileUri: string, fileName: string): Promise<UploadResponse> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload(fileUri, {
                invalidate: true,
                resource_type: "auto",
                filename_override: fileName,
                folder: "product-images", // any sub-folder name in your cloud
                use_filename: true,
            })
            .then((result) => {
                resolve({ success: true, result });
            })
            .catch((error) => {
                reject({ success: false, error });
            });
    });
};

type Param = Promise<{ id: string }>
export async function POST(req: NextRequest, { params }: { params: Param }) {
    const { id } = await params;

    const formData = await req.formData();

    // Extract fields from the request
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const image = formData.get('image') as File | null;




    if (!name || !amount || isNaN(amount)) {
        return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;


    let imageUrl = null;

    // Handle image upload if present
    if (image) {

        const fileBuffer = await image.arrayBuffer();

        const mimeType = image.type;
        const encoding = "base64";
        const base64Data = Buffer.from(fileBuffer).toString("base64");

        // this will be used to upload the file
        const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

        const res = await uploadToCloudinary(fileUri, image.name);

        if (res.success && res.result) {
            imageUrl = res.result.secure_url
        } else {
            NextResponse.json({ error: 'Error during Uplaod Image' }, { status: 500 });
        }

    }
    try {
        const expense = await prisma.expense.create({
            data: {
                name,
                description,
                amount,
                eventId: id,
                addedBy: userId,
                imageUrl: imageUrl
            },
        });

        console.log(expense)

        // Fetch users related to the event
        const eventUsers = await prisma.userEvent.findMany({
            where: { eventId: id },
            include: { user: true }, // Include user details
        });

        console.log(eventUsers)

        // Notify all users except the one who created the expense
        const usersToNotify = eventUsers.filter((userEvent) => userEvent.userId !== userId);

        console.log(usersToNotify)
        console.log(eventUsers)
        for (const { user } of usersToNotify) {
            await sendNotification(user.id, `New expense added: ${name} ($${amount})`);
        }

        // Fetch the created expense with user details
        const detailedExpense = await prisma.expense.findUnique({
            where: { id: expense.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(detailedExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
