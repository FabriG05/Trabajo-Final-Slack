/*
    One-off fix for the "0 members" bug on workspaces:

    1. Owner memberships were created with `invitation_accepted: false`
       (the MemberModel default), so owners were not counted as members
       of their own workspaces. This script accepts those memberships.
    2. It also reports pending invitations, which the workspace list
       endpoint no longer returns after adding the `invitation_accepted: true`
       filter in MemberRepository.getAllWorkspacesByUserId.

    Run from the Backend folder:  node scripts/fix-owner-memberships.js
*/
import mongoose from "mongoose";
import ENVIRONMENT from "../src/Config/Environment.config.js";

const Member = mongoose.connection.collection('members');
const Workspace = mongoose.connection.collection('workspaces');

async function main() {
    await mongoose.connect(
        `${ENVIRONMENT.MONGO_URI}/${ENVIRONMENT.MONGO_DB_NAME}`
    );
    console.log('Connected to', ENVIRONMENT.MONGO_DB_NAME);

    // 1. Accept every Owner membership that is still pending.
    const accepted = await Member.updateMany(
        {
            role: 'Owner',
            invitation_accepted: { $ne: true }
        },
        {
            $set: { invitation_accepted: true }
        }
    );

    console.log(
        `Owner memberships fixed: ${accepted.modifiedCount} ` +
        `(matched ${accepted.matchedCount})`
    );

    // 2. Info: pending invitations that will stop showing up in the lists.
    const pending = await Member.find({ invitation_accepted: { $ne: true } }).toArray();

    if (pending.length === 0) {
        console.log('No pending invitations left in the database.');
    } else {
        console.log(`Pending invitations still in DB: ${pending.length}`);
        for (const invitation of pending) {
            const workspace = await Workspace.findOne({ _id: invitation.FK_id_workspace });
            const user = await mongoose.connection.collection('users').findOne({ _id: invitation.FK_id_user });
            console.log(
                `  - ${user ? user.email : invitation.FK_id_user} -> ` +
                `workspace "${workspace ? workspace.name : '[deleted]'}" ` +
                `(role: ${invitation.role}, expires: ${invitation.invitation_expires_at})`
            );
        }
    }

    await mongoose.disconnect();
    console.log('Done.');
}

main().catch((error) => {
    console.error('Script failed:', error.message);
    process.exit(1);
});
