import React from 'react';
import ReactDOM from 'react-dom/client';
import Cookies from 'js-cookie';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react'
import { countryOptions } from '../common.js'
import { JobDetailsCard } from './JobDetailsCard.jsx';
import { JobApplicant } from './JobApplicant.jsx';
import { ChildSingleInput } from '../../Form/SingleInput.jsx'
import { JobDescription } from './JobDescription.jsx';
import { JobSummary } from './JobSummary.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

export function withRouter(Component) {
    return function (props) {
        const params = useParams();
        return <Component {...props} params={params} />;
    };
}

class CreateJob extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobData: {
                id:"",
                employerID:"",
                title: "",
                description: "",
                summary: "",
                applicantDetails: {
                    yearsOfExperience: { years: 1, months: 1 },
                    qualifications: [],
                    visaStatus:[]
                },
                jobDetails: {
                    categories: { category: "", subCategory: "" },
                    jobType: [],
                    startDate: moment(),
                    salary: { from: 0, to: 0 },
                    location: { country: "", city: ""}
                }
            },
            loaderData: loaderData,
            createUpdateCopyJob: "Create"
        }

        this.jobSchema = Yup.object().shape({
            city: Yup.string().required('Location required'),
            country: Yup.string().required('Country required'),
            subCategory: Yup.string().required('Sub category required'),
            category: Yup.string().required('Category required'),
            jobTypes: Yup.number().min(1, 'At least one job type is required'),
            expiryDate: Yup.date().required('Expiry date required'),
            startDate: Yup.date().required('Start date required'),
            summary: Yup.string().required('Summary required'),
            description: Yup.string().required('Description required'),
            title: Yup.string().required('Title required'),
        });
        
        this.updateStateData = this.updateStateData.bind(this);
        this.addUpdateJob = this.addUpdateJob.bind(this);
        this.loadData = this.loadData.bind(this); 
        this.isJobValid = this.isJobValid.bind(this);
        this.init = this.init.bind(this);
    };

    init() {
        let loaderData = this.state.loaderData;
        loaderData.allowedUsers.push("Employer");
        loaderData.allowedUsers.push("Recruiter");
        loaderData.isLoading = false;
        this.setState({ loaderData, })
    }

    componentDidMount() {
        this.init();
        this.loadData();
    };

    loadData() {
        const { id, copyId } = this.props.params;
        const param = id ? id : "";
        const copyJobParam = copyId ? copyId : "";
        const createUpdateCopyJob = id ? "Update" : copyId ? "Copy" : "Create";
        this.setState({createUpdateCopyJob: createUpdateCopyJob });

        if (param != "" || copyJobParam != "") {
            var link = param != "" ? 'https://competitionservicestalent.azurewebsites.net/listing/listing/GetJobByToEdit?id=' + param
                : 'https://competitionservicestalent.azurewebsites.net/listing/listing/GetJobForCopy?id=' + copyJobParam;
            var cookies = Cookies.get('talentAuthToken');
            $.ajax({
                url: link,
                headers: {
                    'Authorization': 'Bearer ' + cookies,
                    'Content-Type': 'application/json'
                },
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (res) {
                    if (res.success == true) {
                        res.jobData.jobDetails.startDate = moment(res.jobData.jobDetails.startDate);
                        res.jobData.jobDetails.endDate = res.jobData.jobDetails.endDate ? moment(res.jobData.jobDetails.endDate) : null;
                        res.jobData.expiryDate = res.jobData.expiryDate
                            ? moment(res.jobData.expiryDate) > moment()
                                ? moment(res.jobData.expiryDate) : moment().add(14,'days') : null;
                        this.setState({ jobData: res.jobData, createUpdateCopyJob: createUpdateCopyJob })
                    } else {
                        TalentUtil.notification.show(res.message, "error", null, null)
                        setTimeout(function() {
                            window.location = "/ManageJobs";
                        }, 3000);
                    }
                }.bind(this)
            })
        }       
    }

    isJobValid(jobData) {
        const { jobDetails, title, description, summary, expiryDate} = jobData;
        const { location, startDate, jobType, categories } = jobDetails;
        const { country, city } = location;
        const { category, subCategory } = categories;
        const jobTypes = jobType.length;

        const formData = {title, description, summary, country, city, category, subCategory, jobTypes, startDate, expiryDate, };
        const validData = this.jobSchema.validateSync(formData);
        const valid = this.jobSchema.isValidSync(formData);

        return valid;
    }


    addUpdateJob() {
        try {
            var jobData = this.state.jobData;
            if (this.isJobValid(jobData)) {
                var cookies = Cookies.get('talentAuthToken');
                $.ajax({
                    url: 'https://competitionservicestalent.azurewebsites.net/listing/listing/createUpdateJob',
                    headers: {
                        'Authorization': 'Bearer ' + cookies,
                        'Content-Type': 'application/json'
                    },
                    dataType: 'json',
                    type: "post",
                    data: JSON.stringify(jobData),
                    success: function (res) {
                        if (res.success == true) {
                            TalentUtil.notification.show(res.message, "success", null, null);
                            window.location = "/ManageJobs";
                        } else {
                            TalentUtil.notification.show(res.message, "error", null, null)
                        }

                    }.bind(this)
                })
            }
        } catch(error) {
            TalentUtil.notification.show(error, "error", null, null);
        }
    }

    updateStateData(event) {
        const data = Object.assign({}, this.state.jobData)
        data[event.target.name] = event.target.value
        this.setState({
            jobData:data
        })
    }
   
    render() {
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <section className="page-body">
                    <div className="ui container">
                        <div className="ui grid">
                            <div className="row">
                                <div className="sixteen wide center aligned padded column">
                                    <h1>{this.state.createUpdateCopyJob + " Job"}</h1>
                                </div>
                            </div>

                            <div className="row">
                                <div className="sixteen wide column">
                                    <div className="ui form">
                                        <div className="ui grid">
                                            <div className="row">
                                                <div className="twelve wide column">
                                                    <label>* are required fields. Please enter all required fields.</label>
                                                    <h5>
                                                        *Title:
                                                    </h5>
                                                    <ChildSingleInput
                                                        inputType="text"
                                                        name="title"
                                                        value={this.state.jobData.title}
                                                        controlFunc={this.updateStateData}
                                                        maxLength={80}
                                                        placeholder="Enter a title for your job"
                                                        errorMessage="Please enter a valid title"
                                                    />
                                                    <h5>
                                                        *Description:
                                                    </h5>
                                                    <JobDescription
                                                        description={this.state.jobData.description}
                                                        controlFunc={this.updateStateData}
                                                    />
                                                    <br />
                                                    <h5>
                                                        *Summary:
                                                    </h5>
                                                    <JobSummary
                                                        summary={this.state.jobData.summary}
                                                        updateStateData={this.updateStateData} />
                                                    <br />

                                                    <br />
                                                    <JobApplicant
                                                        applicantDetails={this.state.jobData.applicantDetails}
                                                        updateStateData={this.updateStateData}
                                                    />
                                                    <br />
                                                </div>
                                                <div className="four wide column">
                                                    <JobDetailsCard
                                                        expiryDate={this.state.jobData.expiryDate}
                                                        jobDetails={this.state.jobData.jobDetails}
                                                        updateStateData={this.updateStateData}
                                                        createClick={this.addUpdateJob}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <br />
                </section>
            </BodyWrapper>
        )
    }
}

export default withRouter(CreateJob);