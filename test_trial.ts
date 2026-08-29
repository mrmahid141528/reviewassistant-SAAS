import { forceFreeTrialAllocation } from "./src/app/superadmin/businesses/[id]/settings/actions";
forceFreeTrialAllocation("8bffead4-0e01-4a87-9dde-d74a68da2a60", "mrmahid141528@gmail.com")
    .then(console.log)
    .catch(console.error);
