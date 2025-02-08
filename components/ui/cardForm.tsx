import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const cartSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["member", "admin"]),
});

const CartForm = ({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof cartSchema>) => void;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof cartSchema>>({
    resolver: zodResolver(cartSchema),
    defaultValues: {
      email: "",
      role: "member", // Default value
    },
  });

  const selectedRole = watch("role"); // React Hook Form watches the role value

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email Input */}
      <label className="block mb-2">
        Email:
        <input
          type="email"
          className="w-full px-3 py-2 border rounded mt-1"
          {...register("email")}
        />
      </label>
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      {/* Role Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Role
        </label>
        <div className="flex space-x-4 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="member"
              {...register("role")} // Register role with react-hook-form
              className="hidden"
            />
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                selectedRole === "member"
                  ? "border-blue-500"
                  : "border-gray-400"
              }`}
            >
              {selectedRole === "member" && (
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              )}
            </div>
            <span className="text-gray-700">Member</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="admin"
              {...register("role")}
              className="hidden"
            />
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                selectedRole === "admin" ? "border-blue-500" : "border-gray-400"
              }`}
            >
              {selectedRole === "admin" && (
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              )}
            </div>
            <span className="text-gray-700">Admin</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default CartForm;
