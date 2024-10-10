using System;
using System.Security.Principal;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Talent.Common.Auth;
using Talent.Common.Commands;
using Talent.Common.Contracts;
using Talent.Common.Mongo;
using Talent.Common.RabbitMq;
using Talent.Common.Security;
using Talent.Common.Services;
using Talent.Common.Aws;
using Talent.Services.Talent.Domain.Contracts;
using Talent.Services.Talent.Domain.Services;
using Talent.Services.Profile.Domain.Contracts;
using Talent.Services.Profile.Domain.Services;
using Microsoft.AspNetCore.Authentication;

namespace Talent.Services.Listing
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowWebApp", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                // Configure additional JSON serialization settings here if needed
            });

            services.AddLogging();
            services.AddJwt(Configuration);
            services.AddMongoDB(Configuration);
            services.AddRabbitMq(Configuration);
            services.AddAws(Configuration);

            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            Func<IServiceProvider, IPrincipal> getPrincipal = sp => sp.GetService<IHttpContextAccessor>()?.HttpContext?.User;
            services.AddScoped(typeof(Func<IPrincipal>), sp => {
                return () => getPrincipal(sp);
            });

            services.AddScoped<IUserAppContext, UserAppContext>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ITalentService, TalentService>();
            // Uncomment if you need to use an email service
            // services.AddScoped<IEmailService, EmailService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowWebApp");

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}