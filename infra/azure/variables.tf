variable "subscription_id" { type = string }

variable "location" {
  type    = string
  default = "centralindia"
}

variable "vm_size" {
  type    = string
  default = "Standard_B2ats_v2"
  validation {
    condition     = contains(["Standard_B1s", "Standard_B2pts_v2", "Standard_B2ats_v2"], var.vm_size)
    error_message = "Use only the free-tier sizes: Standard_B1s, Standard_B2pts_v2, Standard_B2ats_v2."
  }
}

variable "admin_username" {
  type    = string
  default = "azureuser"
}

variable "ssh_public_key_path" {
  type    = string
  default = "~/.ssh/azure_fyp.pub"
}

variable "my_ip_cidr" {
  type        = string
  description = "Your public IP with /32, for SSH access"
}
