
# Resource Group (Sweden)

resource "azurerm_resource_group" "rg" {
  name     = "hair-salon-rg"
  location = "Sweden Central"
}


# Azure Container Registry (ACR)

resource "azurerm_container_registry" "acr" {
  name                = "hairsalonacr12345" # MUST be globally unique
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
}


# AKS Cluster

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "hair-salon-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "hairsalon"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}


# Allow AKS to Pull from ACR

resource "azurerm_role_assignment" "acr_pull" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

# Kubernetes Namespace

resource "kubernetes_namespace" "app" {
  metadata {
    name = "hair-salon"
  }
}


# Kubernetes Deployment with Probes and Resource Limits
resource "kubernetes_deployment" "app" {
  metadata {
    name      = "hair-salon-deployment"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        app = "hair-salon"
      }
    }

    template {
      metadata {
        labels = {
          app = "hair-salon"
        }
      }

      spec {
        container {
          name  = "hair-salon-container"
          image = "${azurerm_container_registry.acr.login_server}/hair-salon:1.0"

          image_pull_policy = "Always"

          port {
            container_port = 5000
          }

          # Used for health probes to calculate how many procent needs to be used and can be used
          resources {
            requests = {
              cpu    = "250m" # 250 miliCPU
              memory = "128Mi"  # 128 MiB 
            }
            limits = {
              cpu    = "500m"   # Max 500 milliCPU
              memory = "256Mi"   # Max 256 MiB memory
            }
          }

          # Startup probe, checks if application has started
          startup_probe {
            http_get { # Check health
              path = "/health"
              port = 5000
            }
            failure_threshold = 30 # If fails 30 times
            period_seconds    = 10 # Restart the container
          }

          # Readiness probe, checks if application is ready to get traffic
          readiness_probe {
            http_get { # Check health
              path = "/health"
              port = 5000
            }
            initial_delay_seconds = 5 # Wait 5 seconds after container start
            period_seconds        = 5 # Check every 5 seconds
            success_threshold     = 1 # Needs one successful check to be ready
            failure_threshold     = 3 # After 3 failures becomes unready
          }

          # Liveness probe, checks if application is alive
          liveness_probe {
            http_get { # Check health
              path = "/health"
              port = 5000
            }
            initial_delay_seconds = 15 # Wait 15 seconds before first check
            period_seconds        = 20 # Checks every 20 seconds
            failure_threshold     = 3 # After 3 failures restart contianer 
          }
        }
      }
    }
  }

  depends_on = [
    azurerm_role_assignment.acr_pull
  ]
}


# Kubernetes Service (Public LoadBalancer)

resource "kubernetes_service" "app" {
  metadata {
    name      = "hair-salon-service"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "hair-salon"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "LoadBalancer"
  }
}

# Horizontal Pod Autoscaler
resource "kubernetes_horizontal_pod_autoscaler" "app" {
  metadata {
    name      = "hair-salon-hpa"
    namespace = kubernetes_namespace.app.metadata[0].name # Same namespace as our app
  }

  spec {
    max_replicas = 10 # Max 10 pods 
    min_replicas = 2 # Always 2 pods running

  # Links horizontal pod autoscaler to specific deployment
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.app.metadata[0].name 
    }
  # If CPU more than 50% scale up
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 50 # 50% CPU across all pods
        }
      }
    }
  # If memory more than 70% scale up
    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}