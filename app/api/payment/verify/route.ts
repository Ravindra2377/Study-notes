import { NextRequest, NextResponse } from 'next/server';
import { upgradeToPremium } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const { userId, paymentId, orderId, signature } = await request.json();

        if (!userId || !paymentId || !orderId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // TODO: Verify Razorpay payment signature
        // const crypto = require('crypto');
        // const expectedSignature = crypto
        //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        //   .update(orderId + '|' + paymentId)
        //   .digest('hex');
        //
        // if (expectedSignature !== signature) {
        //   return NextResponse.json(
        //     { error: 'Invalid payment signature' },
        //     { status: 400 }
        //   );
        // }

        // Upgrade user to premium
        await upgradeToPremium(userId);

        return NextResponse.json({
            success: true,
            message: 'Successfully upgraded to premium',
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}
