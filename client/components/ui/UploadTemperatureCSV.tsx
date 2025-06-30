export default function UploadTemperatureCSVForm() {
  return <div>form</div>;
}

/*
        <FormLabel>Upload CSV</FormLabel>
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="file"
                  placeholder="Longitude"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

*/
