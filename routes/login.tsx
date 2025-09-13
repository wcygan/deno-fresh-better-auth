import { define } from "../utils.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default define.page(() => {
  return (
    <div class="p-8">
      <h1 class="text-2xl mb-4">Login</h1>
      <LoginForm />
    </div>
  );
});
