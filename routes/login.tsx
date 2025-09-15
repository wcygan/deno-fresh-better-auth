import { define } from "../utils.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default define.page(() => {
  return (
    <div class="p-8">
      <LoginForm />
    </div>
  );
});
